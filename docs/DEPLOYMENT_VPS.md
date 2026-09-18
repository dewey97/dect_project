# 🚀 Hướng Dẫn Triển Khai dect_project Lên VPS (Docker)

Tài liệu này hướng dẫn cách đưa dự án **dect_project** lên máy chủ VPS (Ubuntu / Debian) bằng Docker một cách nhanh nhất, nhẹ nhất và tối ưu nhất.

---

## 📋 1. Chuẩn Bị Trên VPS (Làm 1 lần duy nhất)

Nếu VPS mới chưa cài Docker và Docker Compose, SSH vào VPS và chạy:

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker & Docker Compose plugin
sudo apt install -y docker.io docker-compose-plugin git

# Thêm user hiện tại vào group docker (để chạy docker không cần sudo)
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📥 2. Kéo Mã Nguồn Về VPS

```bash
# Chọn thư mục chứa dự án
cd /var/www  # hoặc cd ~

# Clone dự án từ GitHub
git clone https://github.com/dewey97/dect_project.git
cd dect_project
```

---

## ⚡ 3. Khởi Chạy Ứng Dụng Bằng Docker

Chỉ cần chạy lệnh sau:

```bash
# Cấp quyền thực thi cho script deploy (lần đầu)
chmod +x deploy.sh

# Chạy deploy
./deploy.sh
```

Hoặc chạy trực tiếp bằng Docker Compose:
```bash
docker compose up -d --build
```

Ứng dụng sẽ tự động được biên dịch ở chế độ **Standalone**, khởi chạy trên cổng `3000` của VPS:
- Truy cập: `http://<IP_VPS>:3000`

---

## 🔄 4. Cập Nhật Code Mới (Mỗi khi có commit trên Git)

Mỗi khi bạn commit code mới lên GitHub, chỉ cần SSH vào VPS và gõ 1 dòng:

```bash
cd /var/www/dect_project && ./deploy.sh
```

Script sẽ tự động:
1. `git pull` bản mới nhất.
2. Build lại container không gây gián đoạn.
3. Dọn dẹp cache images cũ để không tốn dung lượng ổ đĩa VPS.

---

## 🌐 5. Cấu Hình Tên Miền & SSL HTTPS (Tùy Chọn)

### Cách A: Dùng Nginx (Nếu VPS đã có sẵn Nginx)
Tạo file `/etc/nginx/sites-available/dect_project`:
```nginx
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Kích hoạt SSL miễn phí bằng Certbot:
```bash
sudo certbot --nginx -d your-domain.com
```

### Cách B: Dùng Cloudflare Tunnel (Không cần mở Port, Miễn Phí, Siêu Bảo Mật)
Cài `cloudflared` trên VPS và trỏ thẳng vào `http://localhost:3000`.
