"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  X,
  Unlock,
  Lock,
  Compass,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { detectiveAudio } from "@/lib/investigation-audio";
import { cn } from "@/lib/utils";
import { usePhoneData } from "@/lib/hooks/use-phone-data";
import {
  getCheckpointHints,
  type SheetCheckpointRow,
} from "@/lib/cms/checkpoint-cms";
import { getStorageItem, setStorageItem } from "@/lib/storage";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActiveHintGroup {
  id: string;
  title: string;
  statusText: string;
  hints: string[];
  /** Checkpoint tương ứng trên tab `checkpoints` của Google Sheet. */
  checkpointId?: string;
}

/**
 * Ghi đè mảng gợi ý tĩnh bằng gợi ý đọc trực tiếp từ Google Sheet.
 * Sheet có bao nhiêu cấp độ thì trả về bấy nhiêu; Sheet rỗng thì giữ nguyên bản tĩnh.
 */
function applySheetHints(
  stage: ActiveHintGroup,
  rows: SheetCheckpointRow[],
): ActiveHintGroup {
  const cpId = stage.checkpointId;
  if (!cpId || rows.length === 0) return stage;

  const row = rows.find((r) => (r.checkpoint_id || "").trim() === cpId);
  const sheetHints = getCheckpointHints(row);
  if (sheetHints.length === 0) return stage;

  return { ...stage, hints: sheetHints };
}

function getContextAwareHintStage(): ActiveHintGroup {
  let isIndictmentSolved = false;
  let isPhoneSolved = false;
  let isReinvestigateUnlocked = false;
  let investigatedSuspects: string[] = [];
  let solvedFollowups: string[] = [];
  let completedCheckpoints: string[] = [];

  try {
    isIndictmentSolved =
      getStorageItem("indictment_solved") === "true";
    isPhoneSolved =
      getStorageItem("phone_solved") === "true" ||
      !!getStorageItem("phone_inputs");
    isReinvestigateUnlocked =
      getStorageItem("reinvestigate_unlocked") === "true";

    const inv = getStorageItem("investigated_suspects");
    if (inv) investigatedSuspects = JSON.parse(inv);

    const fol = getStorageItem("solved_followups");
    if (fol) solvedFollowups = JSON.parse(fol);

    const cp = getStorageItem("completed_checkpoints");
    if (cp) completedCheckpoints = JSON.parse(cp);
  } catch {}

  // 1. CHUYÊN ÁN ĐÃ HOÀN TẤT
  if (
    isIndictmentSolved ||
    completedCheckpoints.includes("cp-000-2b") ||
    completedCheckpoints.includes("cp-000-3")
  ) {
    return {
      id: "stage-completed",
      checkpointId: "cp-000-2b",
      title: "Chuyên Án Đã Hoàn Tất",
      statusText: "Bản cáo trạng đã được Viện Kiểm sát phê chuẩn",
      hints: [
        "Chuyên án đã được phá thành công xuất sắc!",
        "Bạn có thể mở Ký sự Hậu án (Epilogue) để theo dõi toàn bộ lời tự thú và diễn biến sau xét xử.",
      ],
    };
  }

  // 2. LẬP BẢN CÁO TRẠNG
  if (
    solvedFollowups.includes("ha") ||
    completedCheckpoints.includes("cp-000-2a") ||
    completedCheckpoints.includes("cp-000-2")
  ) {
    return {
      id: "stage-indictment",
      checkpointId: "cp-000-2b",
      title: "Lập Bản Cáo Trạng & Kết Án",
      statusText: "Đã thu thập đủ chứng cứ định tội",
      hints: [
        "Thủ phạm chính là Trần Thị Hà, động cơ do mâu thuẫn tình cảm và ghen tuông cực đoan khi Khang chuẩn bị tiền bỏ trốn với Vy.",
        "Nhập chính xác các mã vật chứng: Mục 2.1 là 52; Mục 2.2 là 50 hoặc 51; Mục 2.3 là 53.",
        "Đệ trình bản cáo trạng lên Viện Kiểm sát để hoàn tất chuyên án.",
      ],
    };
  }

  // 3. THẨM TRA HÀ & KHỚP NỐI VẬT CHỨNG
  if (
    investigatedSuspects.includes("ha") ||
    isReinvestigateUnlocked ||
    completedCheckpoints.includes("cp-000-1b")
  ) {
    return {
      id: "stage-ha",
      checkpointId: "cp-000-2a",
      title: "Thẩm Tra Trần Thị Hà & Khớp Nối Vật Chứng",
      statusText: "Đang làm rõ ngoại phạm và chứng cứ phòng trọ",
      hints: [
        "Hà khai ngồi xem phim truyện phát trên VTV3 từ 20:30 đến 21:30. Nhưng kiểm tra Lịch phát sóng VTV3 tối thứ Sáu thực tế chỉ chiếu Gameshow truyền hình.",
        "Trong đoạn tin nhắn thoại lúc 20:32 có lẫn tiếng còi tàu hỏa đặc trưng chỉ nghe thấy rõ khi đứng ngay tại khu vực trước nhà Khang sát đường ray.",
        "Đối chiếu 3 vật phẩm thu tại phòng Hà: Áo gió dính phấn hoa (45, 10, 6), Kéo và lọn tóc mai dính máu (4), Bùa yêu (49).",
      ],
    };
  }

  // 4. BÓC TÁCH MÂU THUẪN VŨ & TÙNG (CÂU HỎI SUY LUẬN)
  if (
    (investigatedSuspects.includes("vu") &&
      investigatedSuspects.includes("tung")) ||
    completedCheckpoints.includes("cp-000-1a") ||
    completedCheckpoints.includes("cp-000-1")
  ) {
    return {
      id: "stage-reinvestigate",
      checkpointId: "cp-000-1b",
      title: "Bóc Tách Mâu Thuẫn Vũ & Tùng",
      statusText: "Đang xác định mốc giờ rời đi và biến cố năm 1996",
      hints: [
        "Hãy mở câu hỏi suy luận của Lê Quang Vũ (mốc rời Quán Bia 88 lúc 21:15) và Nguyễn Thanh Tùng (rời đi lúc 20:15 trước chuyến tàu 20:30).",
        "Lấy vụ ẩu đả và số tiền thanh toán chuyển khoản làm mốc đối chiếu thời gian cho Vũ.",
        "Sau khi trả lời xong câu hỏi của Vũ và Tùng, Lệnh Tái Khám Xét Hiện Trường sẽ được phê duyệt tự động.",
      ],
    };
  }

  // 5. THẨM TRA NGHI PHẠM BƯỚC ĐẦU (VŨ / TÙNG)
  if (isPhoneSolved || completedCheckpoints.includes("cp-000-0")) {
    return {
      id: "stage-suspects",
      checkpointId: "cp-000-1a",
      title: "Thẩm Tra Nghi Phạm Bước Đầu",
      statusText: "Đã xác định 3 SĐT, bắt đầu thẩm tra",
      hints: [
        "Hãy chọn Lê Quang Vũ hoặc Nguyễn Thanh Tùng để thẩm tra động cơ và bóc tách mâu thuẫn ngoại phạm.",
        "Nếu thẩm tra Vũ: chú ý Sổ nợ (13, 10), SMS dev-00 và thời gian xe đón 42. Nếu thẩm tra Tùng: chú ý biến cố năm 1996 (18, 40) và mâu thuẫn hiện trường (20, 41).",
        "Tiếp tục hoàn tất thẩm tra cả 2 đối tượng để mở rộng sang các câu hỏi suy luận.",
      ],
    };
  }

  // 6. KHỞI ĐẦU: TRUY TÌM DANH TÍNH 3 SĐT
  return {
    id: "stage-phone",
    checkpointId: "cp-000-0",
    title: "Truy Tìm Danh Tính 3 SĐT Ẩn Danh",
    statusText: "Giai đoạn khởi đầu điều tra",
    hints: [
      "Hãy mở Điện thoại nạn nhân Khang kiểm tra Nhật ký cuộc gọi và đối chiếu với Sổ nợ, Bảng tin để xác định 3 số lạ trong đêm.",
      "Nạn nhân Nguyễn Văn Khang sinh ngày 04/08/1988 (Mã PIN mở máy: 0408). Đối chiếu Call log với Sổ nợ (10) và Bảng tin (11).",
      "Ba số điện thoại: 0988.200.991 (Lê Quang Vũ - nợ 350M), 0912.331.888 (Nguyễn Thanh Tùng), 0984.180.357 (Đạt Gà Chợ Cảng).",
    ],
  };
}

export function HintModal({ isOpen, onClose }: HintModalProps) {
  const { data: sheetCheckpoints } =
    usePhoneData<SheetCheckpointRow>("checkpoints");

  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, number>>(
    {},
  );
  const [activeStage, setActiveStage] = useState<ActiveHintGroup | null>(null);
  const [activeHintIdx, setActiveHintIdx] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = getStorageItem("hint_unlocked_levels");
        if (saved) {
          setUnlockedLevels(JSON.parse(saved));
        }
      } catch {}
      const rawStage = getContextAwareHintStage();
      const stage = applySheetHints(rawStage, sheetCheckpoints);
      setActiveStage(stage);
      setActiveHintIdx(0);
    }
  }, [isOpen, sheetCheckpoints]);

  if (!isOpen || !activeStage) return null;

  const totalHints = activeStage.hints.length;
  const unlockedCount = Math.min(
    unlockedLevels[activeStage.id] || 1,
    totalHints,
  );
  // Chỉ cho phép xem trong phạm vi các mức đã mở khóa.
  const viewIdx = Math.min(activeHintIdx, Math.max(unlockedCount - 1, 0));

  const handleUnlockNext = () => {
    detectiveAudio.playTypewriterClick();
    const nextCount = Math.min(unlockedCount + 1, totalHints);
    const updated = {
      ...unlockedLevels,
      [activeStage.id]: nextCount,
    };
    setUnlockedLevels(updated);
    setActiveHintIdx(nextCount - 1);
    setStorageItem(
      "hint_unlocked_levels",
      JSON.stringify(updated),
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-xl bg-[#f6f1e5] text-[#1a120b] border-2 border-[#2b1f14] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-none overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* HEADER */}
          <div className="bg-[#ede3d1] p-4 sm:p-5 border-b-2 border-[#2b1f14] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8c1d1d] flex items-center gap-1.5">
                <Lightbulb className="size-3.5 text-[#8c1d1d]" />
                SỔ TAY GỢI Ý ĐIỀU TRA // CASE 000
              </span>
              <h3 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wider">
                Gợi Ý & Manh Mối Phá Án
              </h3>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                detectiveAudio.playPaperRustle();
                onClose();
              }}
              className="p-2 text-[#5c4026] hover:text-black hover:bg-[#dfd3bd] transition-colors rounded-none cursor-pointer border border-[#5c4026]/40 pointer-events-auto"
              title="Đóng"
            >
              <X className="size-5 pointer-events-none" />
            </button>
          </div>

          {/* ACTIVE STAGE CONTENT AREA */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[#f6f1e5] custom-scrollbar">
            {/* STAGE TITLE BAR */}
            <div className="border-b-2 border-[#2b1f14]/20 pb-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#8c1d1d] font-mono text-[11px] font-bold uppercase tracking-wider">
                  <Compass className="size-3.5" />
                  <span>TIẾN TRÌNH HIỆN TẠI</span>
                </div>
                <h4 className="font-mono font-bold text-sm sm:text-base text-[#1a120b] uppercase tracking-wide">
                  {activeStage.title}
                </h4>
              </div>
            </div>

            {/* HINT CARD — chỉ hiển thị MỘT gợi ý tại một thời điểm */}
            <div className="pt-1">
              <div className="p-4 border-2 border-[#2b1f14] bg-[#fdfbf7] text-[#1a120b] shadow-sm rounded-none font-sans text-xs sm:text-[13px] leading-relaxed">
                <div className="flex items-center gap-2 border-b border-[#2b1f14]/15 pb-1.5 mb-2.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase">
                  <span className="flex items-center gap-1.5 text-[#8c1d1d]">
                    <Unlock className="size-3.5" />
                    Gợi ý mức {viewIdx + 1}/{totalHints}
                  </span>
                </div>

                {/*
                  Chiều cao cố định: mọi gợi ý xếp chồng trong CÙNG một ô lưới
                  (col-start-1 row-start-1). Ô lưới cao bằng gợi ý dài nhất nên
                  modal không co giãn khi chuyển mức. Gợi ý khác ẩn bằng opacity.
                */}
                <div className="grid">
                  {activeStage.hints.map((hintText, hIdx) => (
                    <p
                      key={hIdx}
                      aria-hidden={hIdx !== viewIdx}
                      className={cn(
                        "col-start-1 row-start-1 text-[#1a120b] transition-opacity duration-200 ease-out",
                        hIdx === viewIdx
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none select-none",
                      )}
                    >
                      {hintText}
                    </p>
                  ))}
                </div>
              </div>

              {/* Tiến độ mở khóa các mức gợi ý */}
              <div className="flex items-center gap-1.5 pt-3">
                {activeStage.hints.map((_, hIdx) => (
                  <button
                    key={hIdx}
                    type="button"
                    disabled={hIdx >= unlockedCount}
                    onClick={() => {
                      if (hIdx >= unlockedCount) return;
                      detectiveAudio.playTypewriterClick();
                      setActiveHintIdx(hIdx);
                    }}
                    title={
                      hIdx < unlockedCount
                        ? `Xem gợi ý mức ${hIdx + 1}`
                        : `Gợi ý mức ${hIdx + 1} chưa mở khóa`
                    }
                    className={cn(
                      "h-2 flex-1 rounded-none transition-colors",
                      hIdx === viewIdx
                        ? "bg-[#8c1d1d]"
                        : hIdx < unlockedCount
                          ? "bg-[#8c1d1d]/40 hover:bg-[#8c1d1d]/60 cursor-pointer"
                          : "bg-[#2b1f14]/15 cursor-not-allowed",
                    )}
                  />
                ))}
              </div>
            </div>

            {/* ĐIỀU HƯỚNG LÙI / TIẾN GIỮA CÁC MỨC GỢI Ý */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#2b1f14]/20">
              {viewIdx > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    detectiveAudio.playTypewriterClick();
                    setActiveHintIdx((prev) => Math.max(prev - 1, 0));
                  }}
                  className="px-4 py-2 bg-[#eae0cd] hover:bg-[#dfd4be] text-[#2b1f14] border-2 border-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 rounded-none active:scale-95"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>GỢI Ý TRƯỚC</span>
                </button>
              ) : (
                <div />
              )}

              {viewIdx < unlockedCount - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    detectiveAudio.playTypewriterClick();
                    setActiveHintIdx((prev) => prev + 1);
                  }}
                  className="px-4 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-2 border-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 rounded-none active:scale-95 ml-auto"
                >
                  <span>GỢI Ý SAU</span>
                  <ArrowRight className="size-3.5" />
                </button>
              ) : unlockedCount < totalHints ? (
                <button
                  type="button"
                  onClick={handleUnlockNext}
                  className="px-4 py-2 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] border-2 border-[#2b1f14] font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 rounded-none active:scale-95 ml-auto"
                >
                  <Unlock className="size-3.5 text-[#d9a066]" />
                  <span>
                    MỞ GỢI Ý MỚI ({unlockedCount + 1}/{totalHints})
                  </span>
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
