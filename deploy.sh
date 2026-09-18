#!/usr/bin/env bash
set -e

echo "🚀 [1/3] Kéo code mới nhất từ GitHub..."
git pull origin main

echo "📦 [2/3] Xây dựng và khởi chạy Docker container..."
docker compose up -d --build --remove-orphans

echo "🧹 [3/3] Dọn dẹp Docker images cũ không sử dụng..."
docker image prune -f

echo "✅ [HOÀN TẤT] dect_project đã được triển khai thành công trên VPS!"
echo "🌐 Kiểm tra trạng thái: docker compose ps"
