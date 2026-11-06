"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Crown,
  FileText,
  Share2,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useRoomSync } from "@/components/investigation/room/room-sync-context";
import { DetectiveAvatar } from "@/components/investigation/detective-avatar";
import { RoomQr } from "@/components/play/room-qr";
import { roomInviteUrl } from "@/lib/rooms/client";
import { detectiveAudio } from "@/lib/investigation/investigation-audio";
import { cn } from "@/lib/utils";

interface GameplayLoadingScreenProps {
  caseId: string;
  isReady: boolean;
  statusText?: string;
  progress?: number;
  caseSynopsis?: string | null;
  onComplete?: () => void;
}

/**
 * Màn hình Loading chuyển tiếp vào Gameplay mang phong cách Phòng Chờ / Briefing Room.
 * Tối ưu responsive hoàn toàn cho 2 màn hình Mobile và Desktop:
 * - Desktop: 2 Cột chuẩn (Cột trái: Các ô điều tra viên + Thanh loading; Cột phải: Dẫn truyện vụ án + Mẹo nghiệp vụ).
 * - Mobile: Dạng thẻ xếp chồng linh hoạt, thanh loading nổi bật và các ô avatar trực quan.
 */
export function GameplayLoadingScreen({
  caseId,
  isReady,
  statusText = "Đang nạp hồ sơ điều tra...",
  progress = 15,
  caseSynopsis,
  onComplete,
}: GameplayLoadingScreenProps) {
  const { room, me, participants, onlineIds } = useRoomSync();
  const [forceReady, setForceReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(progress);
  const [copied, setCopied] = useState(false);

  const effectiveReady = isReady || forceReady;

  const displayCaseCode = caseId.toUpperCase().replace(/^CASE_?/, "");

  const inviteUrl =
    room?.code
      ? roomInviteUrl(room.caseId || caseId, room.code)
      : typeof window !== "undefined"
      ? `${window.location.origin}/play/${caseId}`
      : "";

  const handleShare = async () => {
    if (!inviteUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Vào phòng điều tra chuyên án",
          text: room?.code ? `Mã phòng ${room.code}` : `Vụ án #${displayCaseCode}`,
          url: inviteUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Safe ignore
    }
  };

  // Safety fallback: Tối đa 5.5 giây sẽ mở khóa nút bấm để tránh treo người chơi nếu rớt mạng
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceReady(true);
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  // Cập nhật mượt mà thanh tiến trình
  useEffect(() => {
    if (effectiveReady) {
      setDisplayProgress(100);
      return;
    }
    setDisplayProgress((prev) => {
      const target = Math.max(prev, progress);
      return target > 95 ? 95 : target;
    });
  }, [progress, effectiveReady]);

  // Chỉ khi người chơi chủ động bấm nút "Vào bàn điều tra" mới kích hoạt chuyển cảnh
  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);
    try {
      detectiveAudio.playPaperRustle();
    } catch {
      // Safe ignore
    }

    setIsFadingOut(true);
    setTimeout(() => {
      setIsDismissed(true);
      if (onComplete) onComplete();
    }, 600);
  };

  if (isDismissed) return null;

  // Danh sách thám tử hiển thị trong các ô
  const hasRoom = Boolean(room && participants.length > 0);
  const roster = hasRoom
    ? participants
    : [
        {
          id: me?.id || "me-solo",
          nickname: me?.nickname || "Điều tra viên",
          isHost: true,
          enteredAt: new Date().toISOString(),
        },
      ];

  const maxSlots = hasRoom ? Math.max(room?.maxPlayers || 4, 4) : 4;
  const emptySlotsCount = Math.max(0, maxSlots - roster.length);

  return (
    <div
      aria-label="Đang nạp bàn điều tra"
      role="status"
      className={`fixed inset-0 z-[100] overflow-y-auto bg-[#070504] text-[#e5d8cb] select-none transition-opacity duration-600 ease-out flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
    >
      {/* Nền hiệu ứng vignette cổ điển */}
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1f150e]/90 via-[#0d0907]/95 to-[#050403]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(38, 27, 18, 0.45) 0%, rgba(7, 5, 4, 0.98) 85%)",
        }}
      />

      {/* Góc hoạ tiết phong cách hồ sơ điều tra */}
      <div className="fixed top-6 left-6 size-4 border-t-2 border-l-2 border-[#d9a066]/30 pointer-events-none hidden sm:block" />
      <div className="fixed top-6 right-6 size-4 border-t-2 border-r-2 border-[#d9a066]/30 pointer-events-none hidden sm:block" />
      <div className="fixed bottom-6 left-6 size-4 border-b-2 border-l-2 border-[#d9a066]/30 pointer-events-none hidden sm:block" />
      <div className="fixed bottom-6 right-6 size-4 border-b-2 border-r-2 border-[#d9a066]/30 pointer-events-none hidden sm:block" />

      {/* KHUNG NỘI DUNG CHÍNH (MAX 6XL CHO DESKTOP BENTO) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto my-auto space-y-6">
        {/* HEADER CHÍNH */}
        <header className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-[#f5ebe1]">
              {effectiveReady ? "Bàn điều tra đã sẵn sàng" : "Đang chuẩn bị hồ sơ điều tra"}
            </h1>
          </div>
          {hasRoom && room?.code && (
            <div className="font-mono text-xs text-amber-400/80">
              Phòng #{room.code}
            </div>
          )}
        </header>

        {/* BỐ CỤC 2 CỘT CHO DESKTOP, CUỘN DỌC TRÊN MOBILE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI (COL 1-7): CÁC Ô ĐIỀU TRA VIÊN & THANH LOADING */}
          <div className="lg:col-span-7 space-y-5">
            {/* LƯỚI CÁC Ô NGƯỜI CHƠI (PLAYER SLOTS) */}
            <div className="rounded-xl border border-zinc-800 bg-[#120e0a]/80 p-4 sm:p-5 space-y-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-bold">
                  Điều tra viên ({roster.length}/{maxSlots})
                </span>
              </div>

              {/* Grid ô thám tử */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {roster.map((p) => {
                  const isMe = p.id === me?.id || p.id === "me-solo";
                  const online = isMe || onlineIds.has(p.id);

                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "relative rounded-xl border p-3.5 sm:p-4 flex flex-col items-center text-center transition-all duration-200",
                        isMe
                          ? "border-amber-600/70 bg-[#1a120c]/95 shadow-[0_0_20px_rgba(217,160,102,0.12)]"
                          : "border-zinc-800 bg-[#120e0a]/80",
                      )}
                    >
                      <div className="relative mb-2.5">
                        <DetectiveAvatar
                          name={p.nickname}
                          size="lg"
                          showOnlineDot
                          isOnline={online}
                          className="size-13 sm:size-15"
                        />
                        {p.isHost && (
                          <div
                            title="Trưởng ban điều tra (Host)"
                            className="absolute -top-1.5 -right-1.5 bg-amber-500 text-zinc-950 p-1 rounded-full shadow-md"
                          >
                            <Crown className="size-3.5 fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="w-full">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-semibold text-zinc-100 text-xs sm:text-sm truncate max-w-[120px]">
                            {p.nickname}
                          </span>
                          {isMe && (
                            <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] font-mono text-zinc-300">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1 text-[10px] sm:text-[11px] font-mono">
                          <span
                            className={cn(
                              "size-1.5 rounded-full inline-block",
                              online ? "bg-emerald-500 animate-pulse" : "bg-zinc-600",
                            )}
                          />
                          <span className={online ? "text-emerald-400" : "text-zinc-500"}>
                            {online ? "Đã vào vị trí" : "Mất kết nối"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Các ô trống */}
                {Array.from({ length: emptySlotsCount }).map((_, i) => (
                  <div
                    key={`loading-empty-${i}`}
                    onClick={handleShare}
                    role="button"
                    tabIndex={0}
                    title="Bấm để sao chép link mời bạn bè gia nhập"
                    className="relative rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/20 hover:border-amber-700/50 hover:bg-amber-950/10 p-3.5 sm:p-4 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer min-h-[130px] group"
                  >
                    <div className="size-12 sm:size-14 rounded-full border border-dashed border-zinc-700/70 flex items-center justify-center mb-2.5 text-zinc-600 group-hover:text-amber-400 group-hover:border-amber-500/50 transition-colors">
                      <UserPlus className="size-5 sm:size-6" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      Chờ thám tử...
                    </span>
                    <span className="text-[10px] font-mono text-amber-500/70 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Share2 className="size-2.5" /> Mời bạn
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* THANH LOADING TIẾN TRÌNH THỰC SỰ */}
            <div className="rounded-xl border border-[#d9a066]/30 bg-[#120e0a]/95 p-4 sm:p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-200 font-semibold uppercase text-[11px] tracking-wider flex items-center gap-2">
                  <Sparkles className="size-3.5 text-amber-400 animate-pulse" />
                  <span>Tiến Trình Nạp Dữ Liệu Bàn Ghim</span>
                </span>
                <span className="text-amber-400 font-bold text-sm">
                  {Math.round(displayProgress)}%
                </span>
              </div>

              {/* Thanh Bar */}
              <div className="w-full h-2.5 bg-[#1c1510] rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-700 via-[#d9a066] to-amber-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(217,160,102,0.6)]"
                  style={{ width: `${Math.min(100, Math.max(8, displayProgress))}%` }}
                />
              </div>

              {/* Trạng thái chi tiết */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-0.5">
                <span className="truncate pr-2">
                  {effectiveReady
                    ? "Bàn điều tra đã sẵn sàng. Nhấn nút bên dưới để vào phá án."
                    : statusText}
                </span>
                <span className="shrink-0 text-amber-500/80 uppercase">
                  {effectiveReady ? "100% Hoàn tất" : "Đang nạp..."}
                </span>
              </div>
            </div>

            {/* NÚT BẤM VÀO BÀN ĐIỀU TRA — NGƯỜI CHƠI BẤM VÀO MỚI VÀO GAME */}
            {effectiveReady ? (
              <button
                type="button"
                onClick={handleEnter}
                disabled={isEntering}
                className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-sm sm:text-base tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(245,158,11,0.35)] hover:shadow-[0_0_45px_rgba(245,158,11,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer animate-pulse"
              >
                <Sparkles className="size-5 fill-current" />
                <span>
                  {isEntering ? "ĐANG VÀO BÀN ĐIỀU TRA..." : "VÀO BÀN ĐIỀU TRA NGAY"}
                </span>
                <ArrowRight className="size-5" />
              </button>
            ) : (
              <div className="w-full py-3.5 px-4 rounded-xl border border-zinc-800 bg-zinc-950/60 text-center text-xs font-mono text-zinc-400 flex items-center justify-center gap-2">
                <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                <span>Đang chuẩn bị hồ sơ & bàn chứng cứ... Vui lòng đợi</span>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (COL 8-12): MÃ PHÒNG & QR CODE TRỰC TIẾP + DẪN TRUYỆN VỤ ÁN */}
          <div className="lg:col-span-5 space-y-4">
            {/* THẺ MÃ PHÒNG & QR CODE TRỰC TIẾP */}
            <div className="rounded-xl border border-amber-900/40 bg-[#140e0a]/90 p-4 sm:p-5 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2.5">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#d9a066] font-bold">
                  {room?.code ? "Mã Phòng & QR Gia Nhập" : "Mời Đồng Đội Vào Phá Án"}
                </span>
                {room?.code && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    Phòng #{room.code}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* QR Code hiển thị trực tiếp trên màn hình */}
                {inviteUrl && (
                  <div className="p-2.5 rounded-xl bg-[#f4efe6] shadow-md shrink-0 flex items-center justify-center">
                    <RoomQr url={inviteUrl} size={120} />
                  </div>
                )}

                {/* Thông tin mã phòng & nút chia sẻ */}
                <div className="flex flex-col items-center sm:items-start justify-center gap-2 text-center sm:text-left flex-1 min-w-0">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      {room?.code ? "Mã Tham Gia" : "Mã Vụ Án"}
                    </span>
                    <div className="select-all font-mono text-2xl sm:text-3xl font-extrabold tracking-[0.2em] text-amber-400">
                      {room?.code || `#${displayCaseCode}`}
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-zinc-400 leading-snug">
                    Quét QR bằng điện thoại hoặc sao chép link để mời điều tra viên vào cùng.
                  </p>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-amber-600/50 bg-amber-950/40 hover:bg-amber-900/50 text-xs font-semibold text-amber-200 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-emerald-400" aria-hidden />
                    ) : (
                      <Share2 className="size-3.5 text-amber-400" aria-hidden />
                    )}
                    <span>{copied ? "Đã sao chép link!" : "Sao chép link mời"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* THẺ DẪN TRUYỆN VỤ ÁN */}
            <div className="rounded-xl border border-[#d9a066]/30 bg-[#120e0a]/90 p-4 sm:p-5 relative overflow-hidden shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2.5">
                <FileText className="size-4 text-[#d9a066]" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#d9a066] font-bold">
                  Dẫn Truyện Vụ Án
                </span>
              </div>
              <p className="text-xs sm:text-sm font-sans text-zinc-300 leading-relaxed italic border-l-2 border-amber-600/50 pl-3 py-1">
                {caseSynopsis ||
                  "Nạn nhân được phát hiện tử vong tại hiện trường với nhiều dấu hiệu đáng ngờ. Toàn bộ các đối tượng tình nghi đều có mặt trong khoảng thời gian xảy ra án mạng với những mâu thuẫn phức tạp về quyền lợi và tiền bạc. Ban chuyên án cần khẩn trương thu thập chứng cứ, đối chiếu lời khai và lật mở động cơ gây án."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
