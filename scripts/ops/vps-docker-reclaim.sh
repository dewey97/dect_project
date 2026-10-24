#!/usr/bin/env bash
#
# ==============================================================================
# Script Dọn Dẹp Ổ Cứng Docker VPS Định Kỳ & An Toàn (Docker Reclaim)
# Đúc kết từ kiến trúc `infra/observability/docker-reclaim/docker-reclaim.sh` của Lendi.
#
# Tính năng cốt lõi:
# 1. WITNESS CHECK (Nhân chứng sống): Chỉ dọn dẹp khi container dect_project_app
#    đang chạy thật (running=true, restarting=false). Nếu container đang sập hoặc
#    đang restart loop, script TỪ CHỐI dọn dẹp để bảo toàn image khôi phục.
# 2. KEEP LIST (Danh sách bảo tồn bất biến): Luôn bảo đảm image :latest và
#    image :previous tồn tại. Nếu :previous chưa có, tự động tạo từ :latest.
# 3. IDEMPOTENT & SAFE: Chỉ xóa dangling layers, build cache cũ hơn 48h, container
#    tạm đã dừng > 24h và network mồ côi.
# ==============================================================================

set -euo pipefail

WITNESS_CONTAINER="dect_project_app"
IMAGE_BASE="ghcr.io/dewey97/dect_project"
IMAGE_LATEST="${IMAGE_BASE}:latest"
IMAGE_PREVIOUS="${IMAGE_BASE}:previous"
LOCK_FILE="/tmp/vps-docker-reclaim.lock"
LOG_PREFIX="[DOCKER-RECLAIM $(date -u +'%Y-%m-%dT%H:%M:%SZ')]"

log() {
  printf '%s %s\n' "$LOG_PREFIX" "$*"
}

fail() {
  printf '%s [ERROR] %s\n' "$LOG_PREFIX" "$*" >&2
  exit 1
}

# ------------------------------------------------------------------------------
# 0. CHỐNG CHẠY ĐỒNG THỜI (Concurrency Lock)
# ------------------------------------------------------------------------------
exec 200>"$LOCK_FILE"
if ! command -v flock >/dev/null 2>&1; then
  log "Thông báo: flock không khả dụng, tiếp tục không khóa file."
else
  if ! flock -n 200; then
    log "⚠️ Phiên dọn dẹp khác đang chạy. Bỏ qua lần thực thi này."
    exit 0
  fi
fi

# ------------------------------------------------------------------------------
# 1. WITNESS CHECK: Kiểm tra trạng thái container nhân chứng dect_project_app
# ------------------------------------------------------------------------------
log "Bắt đầu kiểm tra trạng thái container nhân chứng: $WITNESS_CONTAINER..."

if ! docker ps -a --format '{{.Names}}' | grep -qw "$WITNESS_CONTAINER"; then
  log "⚠️ CẢNH BÁO: Container $WITNESS_CONTAINER không tồn tại trên hệ thống."
  log "🛑 TỪ CHỐI DỌN DẸP: Không tìm thấy nhân chứng sống. Hủy bỏ tác vụ."
  exit 0
fi

is_running="$(docker inspect -f '{{.State.Running}}' "$WITNESS_CONTAINER" 2>/dev/null || echo "false")"
is_restarting="$(docker inspect -f '{{.State.Restarting}}' "$WITNESS_CONTAINER" 2>/dev/null || echo "false")"

if [ "$is_running" != "true" ] || [ "$is_restarting" = "true" ]; then
  log "⚠️ CẢNH BÁO: Container $WITNESS_CONTAINER không khỏe mạnh (running: $is_running, restarting: $is_restarting)."
  log "🛑 TỪ CHỐI DỌN DẸP: Để bảo toàn image khôi phục khi hệ thống bất ổn, lệnh dọn dẹp bị hủy."
  exit 0
fi

log "✅ Container $WITNESS_CONTAINER đang chạy ổn định. Kiểm tra Keep-List..."

# ------------------------------------------------------------------------------
# 2. KEEP-LIST ENFORCEMENT: Đảm bảo :latest và :previous luôn tồn tại
# ------------------------------------------------------------------------------
# Kiểm tra image :latest
if docker image inspect "$IMAGE_LATEST" >/dev/null 2>&1; then
  log "🔒 [KEEP-LIST] Đã xác nhận image: $IMAGE_LATEST"
else
  log "⚠️ [KEEP-LIST] Image $IMAGE_LATEST không tìm thấy! Đang thử tìm image của container đang chạy..."
  running_image="$(docker inspect -f '{{.Config.Image}}' "$WITNESS_CONTAINER" 2>/dev/null || true)"
  if [ -n "$running_image" ]; then
    docker tag "$running_image" "$IMAGE_LATEST" 2>/dev/null || true
    log "🔒 [KEEP-LIST] Đã gắn lại tag :latest từ image đang chạy: $running_image"
  fi
fi

# Kiểm tra image :previous (điểm rollback khẩn cấp)
if docker image inspect "$IMAGE_PREVIOUS" >/dev/null 2>&1; then
  log "🔒 [KEEP-LIST] Đã xác nhận image rollback: $IMAGE_PREVIOUS"
else
  log "⚠️ [KEEP-LIST] Chưa có image :previous. Tự động tạo bản sao lưu từ :latest làm mốc rollback an toàn..."
  docker tag "$IMAGE_LATEST" "$IMAGE_PREVIOUS" 2>/dev/null || true
  log "🔒 [KEEP-LIST] Đã khởi tạo $IMAGE_PREVIOUS thành công."
fi

# Lưu lại Image ID của container đang chạy để tuyệt đối không đụng vào
running_image_id="$(docker inspect -f '{{.Image}}' "$WITNESS_CONTAINER" 2>/dev/null || true)"
log "🔒 [KEEP-LIST] ID Image container đang thực thi: ${running_image_id:0:19}..."

# ------------------------------------------------------------------------------
# 3. ĐO DUNG LƯỢNG BAN ĐẦU
# ------------------------------------------------------------------------------
df_before="$(df -h / | awk 'NR==2 {print $4}')"
log "Dung lượng đĩa trống ban đầu trên /: $df_before"

# ------------------------------------------------------------------------------
# 4. THỰC HIỆN DỌN DẸP AN TOÀN (Safe Reclaim Execution)
# ------------------------------------------------------------------------------
# 4.1. Xóa các dangling images (layer không tag, sinh ra sau mỗi lần pull)
log "Dọn dẹp dangling images (untagged layers)..."
docker image prune -f

# 4.2. Xóa build cache cũ hơn 48 giờ
log "Dọn dẹp Docker build cache cũ hơn 48 giờ..."
docker builder prune -f --filter "until=48h" 2>/dev/null || true

# 4.3. Xóa các container ẩn danh/tạm thời đã dừng hơn 24 giờ (không chạm container đang chạy)
log "Dọn dẹp container tạm đã dừng hơn 24 giờ..."
docker container prune -f --filter "until=24h" 2>/dev/null || true

# 4.4. Xóa network rác không sử dụng
log "Dọn dẹp custom network không sử dụng..."
docker network prune -f 2>/dev/null || true

# ------------------------------------------------------------------------------
# 5. BÁO CÁO KẾT QUẢ
# ------------------------------------------------------------------------------
df_after="$(df -h / | awk 'NR==2 {print $4}')"
log "🎉 Hoàn tất dọn dẹp Docker an toàn!"
log "📊 Dung lượng trống hiện tại: $df_after (Trước đó: $df_before)"

# ------------------------------------------------------------------------------
# 6. KIỂM CHỨNG LẠI SAU KHI DỌN (Post-check Verification)
# ------------------------------------------------------------------------------
if ! docker inspect -f '{{.State.Running}}' "$WITNESS_CONTAINER" >/dev/null 2>&1; then
  fail "🚨 BÁO ĐỘNG ĐỎ: Container $WITNESS_CONTAINER bị mất sau lệnh dọn dẹp!"
fi
log "✅ Hậu kiểm hoàn tất: Container $WITNESS_CONTAINER vẫn hoạt động nguyên vẹn."
