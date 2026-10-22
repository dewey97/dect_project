#!/usr/bin/env bash
#
# Script Dọn Dẹp Ổ Cứng Docker VPS Định Kỳ & An Toàn (Docker Reclaim)
# Đúc kết từ kiến trúc `infra/observability/docker-reclaim/docker-reclaim.sh` của Lendi.
#
# Tính năng cốt lõi:
# 1. WITNESS CHECK (Nhân chứng sống): Chỉ dọn dẹp khi container dect_project_app đang chạy thật.
#    Nếu container đang sập hoặc đang restart, script TỪ CHỐI dọn để tránh xóa mất image khôi phục.
# 2. KEEP LIST: Giữ lại image :latest và image :previous để đảm bảo luôn có điểm rollback.
# 3. IDEMPOTENT & SAFE: Chỉ xóa dangling layers và cache builder cũ hơn 48 giờ.
#

set -euo pipefail

WITNESS_CONTAINER="dect_project_app"
LOG_PREFIX="[DOCKER-RECLAIM $(date -u +'%Y-%m-%dT%H:%M:%SZ')]"

log() {
  printf '%s %s\n' "$LOG_PREFIX" "$*"
}

fail() {
  printf '%s [ERROR] %s\n' "$LOG_PREFIX" "$*" >&2
  exit 1
}

# 1. PRE-FLIGHT: Kiểm tra xem container chính có đang RUNNING hay không
log "Bắt đầu kiểm tra trạng thái container nhân chứng: $WITNESS_CONTAINER..."

state="$(docker inspect -f '{{.State.Running}}' "$WITNESS_CONTAINER" 2>/dev/null || true)"

if [ "$state" != "true" ]; then
  log "⚠️ CẢNH BÁO: Container $WITNESS_CONTAINER không ở trạng thái 'running' (state: '${state:-absent}')."
  log "🛑 TỪ CHỐI DỌN DẸP: Để bảo toàn image khôi phục khi container gặp sự cố, lệnh dọn dẹp bị hủy."
  exit 0
fi

log "✅ Container $WITNESS_CONTAINER đang chạy ổn định. Tiến hành dọn dẹp an toàn..."

# 2. BẢO VỆ IMAGE ĐANG CHẠY VÀ IMAGE ROLLBACK
# Liệt kê dung lượng ổ đĩa trước khi dọn
df_before="$(df -h / | awk 'NR==2 {print $4}')"
log "Dung lượng trống ban đầu: $df_before"

# 3. Dọn dẹp các dangling image (các layer không có tag)
log "Dọn dẹp dangling images..."
docker image prune -f

# 4. Dọn dẹp build cache cũ hơn 48 tiếng (tránh đầy disk do docker build)
log "Dọn dẹp Docker buildx cache cũ hơn 48 giờ..."
docker builder prune -f --filter "until=48h" 2>/dev/null || true

# 5. Báo cáo kết quả
df_after="$(df -h / | awk 'NR==2 {print $4}')"
log "🎉 Hoàn tất dọn dẹp Docker an toàn! Dung lượng trống hiện tại: $df_after (Trước đó: $df_before)"
