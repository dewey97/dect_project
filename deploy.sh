#!/usr/bin/env bash
set -e

echo "🚀 [1/3] Kéo code cấu hình và Docker image mới nhất..."
git fetch origin main
git reset --hard origin/main
docker compose pull app || true

echo "📦 [2/3] Khởi chạy container với phiên bản mới..."
docker compose up -d --force-recreate --remove-orphans

echo "🧹 [3/3] Dọn dẹp Docker images cũ không sử dụng..."
docker image prune -f

echo "✅ [HOÀN TẤT] dect_project đã được cập nhật thành công trên VPS!"
echo "🌐 Kiểm tra trạng thái: docker compose ps"
