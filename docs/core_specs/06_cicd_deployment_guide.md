# Hướng Dẫn Kiến Trúc Triển Khai & CI/CD Tự Động Hóa (VPS Docker & GitHub Actions)

> **Tài liệu Kỹ thuật Tầng 1 (Technical Spec #06)** — Quy trình tự động hóa đóng gói Docker image, lưu trữ trên GitHub Container Registry (GHCR) và triển khai siêu tốc lên máy chủ VPS Production.

---

## 🌟 1. Tổng Quan Kiến Trúc Triển Khai (Deployment Architecture)

Dự án `dect_project` sử dụng luồng CI/CD hiện đại tách biệt hoàn toàn giữa **Môi trường Build (Build Environment)** và **Môi trường Chạy (Runtime VPS)**:

```
[ Developer Local ]
       │  git push origin main / PR
       ▼
[ GitHub Repository (dewey97/dect_project) ]
       │  Trigger Workflow (.github/workflows/deploy.yml)
       │  (Concurrency Group: Auto-cancel PR runs cũ)
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Job 1: Pre-Flight Check (TypeScript & Lint Gate)         │
│ - Tải mã nguồn & kích hoạt Node.js 22                       │
│ - Cài đặt dependencies (npm ci --legacy-peer-deps + cache)  │
│ - Chạy kiểm thử: `npm run lint` (`tsc --noEmit`)            │
│ ➔ Bắt sạch 100% lỗi type trước khi tốn phút build Docker    │
└─────────────────────────────────────────────────────────────┘
       │  Pass Pre-Flight & (Event == push main | dispatch)
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 🐳 Job 2: GitHub Actions Cloud Runner                       │
│ - Tải mã nguồn & kích hoạt Docker Buildx                    │
│ - Tận dụng GitHub Actions Cache (gha) siêu tốc              │
│ - Biên dịch Next.js 16 Production & đóng gói Standalone     │
│ - Đẩy Image lên GitHub Container Registry (GHCR):           │
│   🏷️ ghcr.io/dewey97/dect_project:latest                    │
│   🏷️ ghcr.io/dewey97/dect_project:sha-<commit_sha>          │
└─────────────────────────────────────────────────────────────┘
       │  Build & Push Success -> Trigger Job 3
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 🚀 Job 3: Safe Deploy, Healthcheck & Auto-Rollback to VPS   │
│ - Kết nối SSH an toàn qua `appleboy/ssh-action`             │
│ - Mục tiêu: VPS IP `72.62.199.110` (/var/www/dect_project)  │
│ - Backup tag: `docker tag :latest :previous` phòng rủi ro   │
│ - Kéo Image mới & khởi chạy: `docker compose up -d`         │
│ - 🩺 Probing Healthcheck: Polling HTTP 200 trong 45s        │
│   ├─ NẾU LỖI: Tự động khôi phục image :previous & báo đỏ   │
│   └─ NẾU OK: Giữ nguyên & dọn dẹp layer dangling cũ         │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
[ 🌐 Production Live: Container dect_project_app (Port 3000) ]
```

---

## ⚡ 2. Điểm Khác Biệt & Lợi Ích Vượt Trội

| Tiêu Chí                   | Quy Trình Thủ Công Cũ                                                | CI/CD Tự Động Hóa Mới (GHCR + VPS)                |
| :------------------------- | :------------------------------------------------------------------- | :------------------------------------------------ |
| **Thao tác Developer**     | `git push` ➔ Mở terminal ➔ `ssh vps` ➔ `bash deploy.sh`              | **Chỉ cần đúng 1 lệnh `git push origin main`**    |
| **Tài nguyên VPS**         | VPS phải gánh toàn bộ CPU/RAM để build Next.js (dễ lỗi OOM/treo VPS) | **VPS 0% tải khi build** (GitHub Cloud gánh 100%) |
| **Thời gian cập nhật VPS** | 3 – 5 phút / lần                                                     | **5 – 10 giây** (chỉ tải image đã build sẵn)      |
| **Tính an toàn**           | Dễ lỗi môi trường giữa máy local và VPS                              | **Nhất quán 100%** qua Docker container chuẩn hóa |
| **Trạng thái Vercel**      | Dễ xung đột và dính giới hạn spend cap                               | **Đã xóa bỏ hoàn toàn**, VPS là đích đến duy nhất |

---

## 🔑 3. Cấu Hình GitHub Secrets

Hệ thống CI/CD yêu cầu 3 biến bảo mật được khai báo tại **GitHub Repository Settings ➔ Secrets and variables ➔ Actions**:

| Secret Name   | Kiểu        | Mô Tả / Giá Trị                             |
| :------------ | :---------- | :------------------------------------------ |
| `VPS_HOST`    | String      | Địa chỉ IP máy chủ VPS: `72.62.199.110`     |
| `VPS_USER`    | String      | Tài khoản quản trị SSH: `root`              |
| `VPS_SSH_KEY` | Private Key | Khóa riêng tư OpenSSH (`~/.ssh/id_ed25519`) |

---

## 📂 4. Cấu Trúc Các Tệp Tin Cấu Hình

### 4.1. GitHub Actions Workflow (`.github/workflows/deploy.yml`)

- **Tự động kích hoạt**: Khi có commit mới đẩy lên nhánh `main`, tạo PR vào `main`, hoặc kích hoạt thủ công (_Run workflow_).
- **Concurrency Management**: Tự động hủy (`cancel-in-progress`) các lần chạy cũ trên PR khi có commit mới nhằm tiết kiệm tài nguyên.
- **3 Giai đoạn thực thi (3-Stage Execution)**:
  1. `preflight`: Kiểm tra cú pháp và kiểu dữ liệu TypeScript (`npm run lint` / `tsc --noEmit`). Chặn đứng lỗi trước khi chuyển sang build Docker.
  2. `build-and-push`: Biên dịch và đóng gói Docker image với Buildx, đẩy lên GHCR (`:latest` và `:sha-<commit>`) có cache `gha`. (Chỉ chạy trên nhánh `main`).
  3. `deploy-to-vps`: SSH vào VPS, backup tag `:previous`, kéo image mới, khởi chạy lại, thăm dò Health Check (`curl`/`wget` mỗi 3s trong 45s). Nếu lỗi, tự động rollback về `:previous` và thoát mã lỗi 1; nếu thành công, dọn dẹp layer dangling.
- **Quyền hạn**: `packages: write` cho phép đẩy image trực tiếp lên GHCR mà không cần cấu hình thêm token bên ngoài.

### 4.2. Dockerfile Đa Tầng (`Dockerfile`)

- **Base Image**: `node:22-alpine` (Đồng bộ phiên bản Node.js hiện đại).
- **Bộ nhớ tối ưu**: Khai báo `ENV NODE_OPTIONS="--max-old-space-size=4096"` đảm bảo quá trình biên dịch TypeScript không bị gián đoạn.
- **Output Standalone**: Tận dụng tính năng `output: 'standalone'` của Next.js giúp giảm dung lượng image production từ ~1.5GB xuống còn ~150MB.

### 4.3. Docker Compose (`docker-compose.yml`)

```yaml
services:
  app:
    image: ghcr.io/dewey97/dect_project:latest
    build:
      context: .
      dockerfile: Dockerfile
    container_name: dect_project_app
    restart: always
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
```

---

## 🛠️ 5. Hướng Dẫn Vận Hành & Bảo Trì

### 5.1. Triển khai code mới

Mỗi khi hoàn thành tính năng:

```bash
git add .
git commit -m "feat(scope): mô tả tính năng mới"
git push origin main
```

Theo dõi tiến trình trực tiếp tại tab **Actions** trên GitHub.

### 5.2. Kiểm tra trạng thái trên VPS khi cần

```bash
# Đăng nhập SSH
ssh vps

# Xem trạng thái container
docker compose -f /var/www/dect_project/docker-compose.yml ps

# Xem log runtime realtime
docker compose -f /var/www/dect_project/docker-compose.yml logs -f app --tail=100

# Khởi động lại thủ công khẩn cấp
cd /var/www/dect_project && bash deploy.sh
```

### 5.3. Gia Cố An Ninh & Dọn Dẹp Định Kỳ (WT-7 Infrastructure Hardening)

Chi tiết đầy đủ tại [`deploy/INFRA_HANDOFF_CHECKLIST.md`](../../deploy/INFRA_HANDOFF_CHECKLIST.md):

- **Loopback Binding**: `127.0.0.1:3000:3000` chặn kết nối trực tiếp bỏ qua Reverse Proxy.
- **Caddy Edge Proxy**: `deploy/caddy/Caddyfile` hỗ trợ HSTS `max-age=31536000`, redact query parameters trong access log (`[redacted]`), forward `X-Real-IP`.
- **Dọn Đĩa Tự Động (03:00 AM)**: Systemd timer chạy `scripts/ops/vps-docker-reclaim.sh`, có cơ chế Witness Container check và bảo tồn Keep-List `:latest` + `:previous`.
- **Systemd Commands**:
  ```bash
  systemctl enable --now docker-reclaim.timer
  systemctl list-timers --all | grep docker-reclaim
  ```

---

## 🛑 6. Chính Sách Ngắt Kết Nối Vercel (Vercel Disconnected Policy)

- Toàn bộ dự án `dect_project` đã được **gỡ bỏ và xóa vĩnh viễn khỏi Vercel**.
- Sau khi `git push`, AI Agent và quy trình phát triển **tuyệt đối không kiểm tra hoặc gọi API Vercel**, tập trung toàn bộ vào luồng Docker VPS.
