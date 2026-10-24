# Bảng Kiểm & Hướng Dẫn Bàn Giao Hạ Tầng (WT-7 — Infrastructure Hardening)

> **Mục tiêu**: Hướng dẫn chi tiết dành cho Chủ dự án / DevOps Admin để áp dụng các thay đổi hạ tầng từ WT-7 lên VPS Production (`72.62.199.110`).

---

## 📋 Danh Mục Bàn Giao Kỹ Thuật

| Hạng mục                          | Tệp tin cấu hình                                                         | Tác động an ninh / vận hành                                                                                                                 |
| :-------------------------------- | :----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Loopback Port Binding**      | `docker-compose.yml`                                                     | Đổi `3000:3000` -> `127.0.0.1:3000:3000`. Chặn đứng kẻ xấu bypass Reverse Proxy truy cập trực tiếp IP cổng 3000 hoặc giả lập header IP.     |
| **2. Edge Reverse Proxy (Caddy)** | `deploy/caddy/Caddyfile`<br>`deploy/caddy/docker-compose.caddy.yml`      | Kích hoạt HSTS `max-age=31536000`, tự động che giấu query parameter trong log (`[redacted]`) tránh rò rỉ token/secret, forward `X-Real-IP`. |
| **3. Safe Disk Reclaim**          | `scripts/ops/vps-docker-reclaim.sh`<br>`deploy/systemd/docker-reclaim.*` | Dọn dẹp ổ cứng an toàn định kỳ 03:00 AM. Có kiểm tra Witness container đang chạy và bảo tồn Keep-List `:latest` + `:previous`.              |
| **4. Security Audit Checklist**   | Thủ công (Supabase / VPS)                                                | Bật bảo vệ mật khẩu rò rỉ, xác nhận quyền hạn biến môi trường backend.                                                                      |

---

## 🚀 Các Bước Cấu Hình Trực Tiếp Trên VPS (`72.62.199.110`)

### Bước 1: Áp dụng Cấu hình Docker Compose Mới (Port Binding 127.0.0.1)

Sau khi code WT-7 được merge vào `main` và CI/CD deploy hoàn tất:

```bash
# Đăng nhập vào VPS
ssh root@72.62.199.110

# Di chuyển vào thư mục dự án
cd /var/www/dect_project

# Kiểm tra git pull code mới nhất
git pull origin main

# Khởi chạy lại container với port binding mới
docker compose up -d --force-recreate

# Kiểm tra port binding thực tế
docker compose ps
# Kết quả mong đợi tại cột Ports: 127.0.0.1:3000->3000/tcp
```

**Kiểm tra an ninh (Pen-test nhanh)**:

- Từ máy tính cá nhân (ngoài internet), chạy:
  ```bash
  curl -I --connect-timeout 3 http://72.62.199.110:3000
  ```
- **Kết quả đạt chuẩn**: Kết nối bị từ chối (`Connection refused`) hoặc Timeout. Không còn truy cập trực tiếp được port 3000 từ internet.

---

### Bước 2: Cài đặt Systemd Timer Dọn Ổ Cứng Định Kỳ (03:00 AM)

```bash
# 1. Phân quyền thực thi cho script dọn dẹp
chmod +x /var/www/dect_project/scripts/ops/vps-docker-reclaim.sh

# 2. Copy service và timer vào thư mục systemd của hệ thống
cp /var/www/dect_project/deploy/systemd/docker-reclaim.service /etc/systemd/system/
cp /var/www/dect_project/deploy/systemd/docker-reclaim.timer /etc/systemd/system/

# 3. Nạp lại cấu hình systemd daemon
systemctl daemon-reload

# 4. Kích hoạt và bật timer chạy tự động
systemctl enable --now docker-reclaim.timer

# 5. Kiểm tra trạng thái timer
systemctl status docker-reclaim.timer
systemctl list-timers --all | grep docker-reclaim

# 6. Chạy thử nghiệm ngay một lần để kiểm tra log
systemctl start docker-reclaim.service
journalctl -u docker-reclaim.service -n 50 --no-pager
```

---

### Bước 3: Triển khai Caddy Edge Reverse Proxy (Nếu dùng Caddy thay/phía trước Traefik)

Dự án cung cấp sẵn 2 phương án triển khai Caddy:

#### Phương án A: Chạy Caddy Native trên máy chủ Ubuntu VPS

```bash
# Cài đặt Caddy (nếu chưa có)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# Copy cấu hình Caddyfile đã chuẩn bị
cp /var/www/dect_project/deploy/caddy/Caddyfile /etc/caddy/Caddyfile

# Kiểm tra cú pháp
caddy validate --config /etc/caddy/Caddyfile

# Khởi động lại service Caddy
sudo systemctl reload caddy
```

#### Phương án B: Chạy Caddy qua Docker Compose (Host Network)

```bash
cd /var/www/dect_project/deploy/caddy
docker compose -f docker-compose.caddy.yml up -d
docker compose -f docker-compose.caddy.yml logs -f
```

**Kiểm tra xác thực Caddy**:

1. **Kiểm tra HSTS**:
   ```bash
   curl -sI https://xplore.vn | grep -i strict-transport-security
   # Kết quả: strict-transport-security: max-age=31536000; includeSubDomains; preload
   ```
2. **Kiểm tra che giấu query log**:
   ```bash
   curl -s "https://xplore.vn/?test_token=SECRET123" > /dev/null
   tail -n 5 /var/log/caddy/access.log | grep -E "SECRET123|redacted"
   # Chuỗi SECRET123 không được xuất hiện, chỉ thấy "[redacted]"
   ```

---

### Bước 4: Checklist An Ninh Thủ Công Cho Chủ Dự Án

- [ ] **Bật Leaked Password Protection trên Supabase Dashboard**:
  - Truy cập: Supabase Dashboard ➔ Project Settings ➔ Authentication ➔ Security.
  - Bật tùy chọn `Leaked Password Protection` (HaveIBeenPwned API integration).
- [ ] **Kiểm tra biến môi trường Backend**:
  - Đảm bảo `SUPABASE_SERVICE_ROLE_KEY` chỉ có trong file `.env` trên VPS (`/var/www/dect_project/.env`), không bao giờ có prefix `NEXT_PUBLIC_` và không bị import vào client component.
- [ ] **Kiểm tra Git cache `.env`**:
  - Chạy `git status` đảm bảo `.env` nằm trong `.gitignore` và không bị theo dõi bởi git tracking.
