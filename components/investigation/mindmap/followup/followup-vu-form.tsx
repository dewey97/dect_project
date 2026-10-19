import React from 'react'
import { ArrowRight } from 'lucide-react'
import { detectiveAudio } from '@/lib/investigation-audio'
import { CheckpointHintSection } from '@/components/investigation/checkpoint-hint-section'

interface FollowupVuFormProps {
  caseId: string
  vuTimeInput: string
  onVuTimeInputChange: (val: string) => void
  errorMsg: string
  onClearError: () => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function FollowupVuForm({
  caseId,
  vuTimeInput,
  onVuTimeInputChange,
  errorMsg,
  onClearError,
  onSubmit,
  onClose,
}: FollowupVuFormProps) {
  return (
    <form onSubmit={onSubmit} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 bg-[#f6f1e5] paper-scrollbar">
      {errorMsg && (
        <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 font-mono text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* MỞ TÚI HỒ SƠ B INSTRUCTION */}
      <div className="p-3 bg-[#ebdcc4] border-2 border-[#8c1d1d] rounded-none shadow-sm">
        <span className="font-mono text-xs font-bold text-[#8c1d1d] uppercase tracking-wider">
          📂 MỞ TÚI HỒ SƠ B
        </span>
      </div>

      {/* QUESTION BOX */}
      <div className="p-4 bg-[#f4ebd9] border-2 border-[#a88c6f] rounded-none">
        <span className="font-mono text-[11px] font-bold text-[#6b4e2e] uppercase block mb-1">
          CÂU HỎI:
        </span>
        <p className="text-xs sm:text-sm font-bold text-[#1a120b] leading-relaxed">
          Xác định mốc thời gian Vũ rời khỏi Quán Bia 88
        </p>
      </div>

      {/* ANSWER INPUT */}
      <div className="space-y-2">
        <label className="font-mono text-xs font-bold text-[#4a3520] uppercase tracking-wider block">
          Cách trả lời: Nhập text format &quot;hh:mm&quot; (giờ:phút)
        </label>
        <p className="text-xs text-[#6b4e2e] font-mono italic">
          Ví dụ: 12:00, 13:30,...
        </p>
        <input
          type="text"
          value={vuTimeInput}
          onChange={(e) => {
            onVuTimeInputChange(e.target.value)
            onClearError()
          }}
          className="w-full p-3.5 bg-[#fdfcf9] border-2 border-[#2b1f14] text-[#1a120b] font-mono text-base font-bold placeholder-[#a88c6f]/60 focus:outline-none focus:ring-2 focus:ring-[#8c1d1d]"
        />
      </div>

      {/* GỢI Ý ĐIỀU TRA ĐẨY XUỐNG DƯỚI FORM NHẬP */}
      <CheckpointHintSection
        checkpointId="cp-000-1a-followup"
        caseId={caseId}
      />

      {/* FOOTER */}
      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            detectiveAudio.playPaperRustle()
            onClose()
          }}
          className="px-4 py-2 bg-[#dfd3bd] hover:bg-[#d4c5ab] border-2 border-[#4a3520] text-[#2b1f14] text-xs font-mono font-bold rounded-none transition-colors cursor-pointer"
        >
          ĐÓNG
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#2b1f14] hover:bg-[#140d08] text-[#f6f1e5] font-mono font-bold text-xs uppercase tracking-wider rounded-none transition-all flex items-center gap-2 border-2 border-[#2b1f14] shadow-md cursor-pointer active:scale-95"
        >
          <span>CẬP NHẬT KẾT LUẬN</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </form>
  )
}
