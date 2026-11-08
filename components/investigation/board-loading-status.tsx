"use client";

/**
 * Dòng trạng thái nạp dữ liệu, nổi ở cuối bàn điều tra.
 * Bàn hiện ngay khi vào route (cổng vào là nút ở /play hoặc phòng chờ);
 * dòng này chỉ báo phần còn đang tải và tự ẩn khi xong.
 */
export function BoardLoadingStatus({
  isReady,
  statusText = "Đang nạp hồ sơ điều tra...",
  progress = 15,
}: {
  isReady: boolean;
  statusText?: string;
  progress?: number;
}) {
  if (isReady) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-amber-500/30 bg-zinc-950/90 px-4 py-2 font-mono text-[11px] text-zinc-300 shadow-xl backdrop-blur"
    >
      <span className="size-2 animate-ping rounded-full bg-amber-400" aria-hidden />
      <span>{statusText}</span>
      <span className="text-amber-400">{Math.round(progress)}%</span>
    </div>
  );
}
