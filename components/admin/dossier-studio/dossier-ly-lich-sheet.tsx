'use client'

import React from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LyLichData, PaperConfig } from '@/types/dossier'
import type { DbDossierDocument } from '@/lib/actions/dossier-actions'

interface DossierLyLichSheetProps {
  docItem: DbDossierDocument
  docData: LyLichData
  docPaper: PaperConfig
  isSelected?: boolean
  highlightEditable?: boolean
  showSeal?: boolean
  sealAngle?: number
  canMoveLeft?: boolean
  canMoveRight?: boolean
  onMoveLeft?: () => void
  onMoveRight?: () => void
  onSelect?: () => void
  onUpdateDoc?: (tagCode: string, updater: (prev: LyLichData) => LyLichData) => void
  readOnly?: boolean
}

export function DossierLyLichSheet({
  docItem,
  docData,
  docPaper,
  isSelected = false,
  highlightEditable = false,
  showSeal = true,
  sealAngle = -5,
  canMoveLeft = false,
  canMoveRight = false,
  onMoveLeft,
  onMoveRight,
  onSelect = () => {},
  onUpdateDoc = () => {},
  readOnly = false
}: DossierLyLichSheetProps) {
  const caseSubtitle = docData.caseSubtitle || 'VỤ ÁN MẠNG TẠI SỐ 14 ĐƯỜNG BỜ SÔNG'
  const archiveNote = docData.archiveNote || 'Bản trích lục này được lập thành 02 bản đính kèm hồ sơ nghiệp vụ số 14/QĐ-ĐT ngày 25/07/2016 của Cơ quan CSĐT Công an TP. Hà Nội.'
  const caseFileNumber = docData.caseFileNumber || '14/QĐ-ĐT'
  const archiveStatus = docData.archiveStatus || 'Đã đối chiếu tàng thư'
  const signingCity = docData.signingCity || 'Hà Nội'
  const signingDay = docData.signingDay || '25'
  const signingMonth = docData.signingMonth || '07'
  const signingYear = docData.signingYear || '2016'
  const investigatorRankAndName = docData.investigatorRankAndName || 'Đại úy Lê Minh'

  return (
    <div
      id={`doc-sheet-${docItem.tag_code}`}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-6 transition-all",
        !readOnly && "cursor-pointer group p-3 rounded-2xl border-2",
        !readOnly && (isSelected
          ? "border-amber-500/80 bg-amber-500/5 shadow-2xl ring-4 ring-amber-500/10"
          : "border-transparent hover:border-white/20 hover:bg-white/[0.02]"
        )
      )}
    >
      {/* Header Label */}
      {!readOnly && (
        <div className="flex items-center justify-between w-full px-2 py-1 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-mono font-bold px-2 py-0.5 rounded text-[11px]",
                isSelected ? "bg-amber-500 text-black font-extrabold" : "bg-zinc-800 text-zinc-300"
              )}
            >
              {docItem.tag_code}
            </span>
            <span className="font-semibold text-zinc-200 text-sm max-w-[160px] truncate">
              {docData.fullName || docItem.subject_name}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Lý Lịch (Figma Master)
          </span>
        </div>
      )}

      {/* Khung tài liệu: Chuẩn 1:1 theo Figma Master (Double Red Border, Dotted lines, Đầy đủ chứng nhận điều tra) */}
      <div
        style={{
          width: '1050px',
          height: '730px',
          fontFamily: 'EB Garamond, serif'
        }}
        className="print-canvas-hs bg-[#FAF7EE] p-[15px] shadow-2xl relative select-text text-[#171717] flex justify-between items-stretch overflow-hidden print-page-break"
      >
        {/* NỬA TRÁI (TRANG 1) - KHUNG VIỀN ĐÔI MÀU ĐỎ #BA2B27 */}
        <div className="w-[500px] h-[699px] bg-[#FFFDF6] border-[3px] border-[#BA2B27] p-2 relative flex flex-col justify-between">
          {/* Viền chỉ trong mảnh 1px */}
          <div className="absolute inset-[3px] border border-[#BA2B27] pointer-events-none" />

          <div className="relative z-10 px-4 pt-3">
            {/* Quốc hiệu tiêu ngữ */}
            <div className="text-center space-y-0.5 mb-2">
              <div className="font-sans font-bold text-[11px] uppercase tracking-[0.05em] text-[#262626]">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="font-bold text-[12px] text-[#262626]">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="w-24 h-px bg-[#262626] mx-auto my-1" />
            </div>

            {/* Tiêu đề văn bản: Đỏ son #BA2B27 */}
            <div className="text-center mb-4">
              <h2 className="font-bold text-[18px] uppercase tracking-[-0.02em] text-[#BA2B27] leading-tight">
                BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP
              </h2>
              <p className="text-[12px] text-[#404040] italic pt-0.5">
                Cơ quan Cảnh sát Điều tra TP. Hà Nội
              </p>
            </div>

            {/* Khối Ảnh 3x4 & Thông tin cơ bản */}
            <div className="flex gap-4 items-start mb-3">
              {/* Khung ảnh 3x4 */}
              <div className="w-[96px] h-[128px] border border-[#A3A3A3] shadow-sm relative flex-shrink-0 bg-neutral-200 overflow-hidden">
                {docData.photoUrl ? (
                  <img src={docData.photoUrl} alt="Ảnh nhận diện" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-[10px]">
                    <ImageIcon className="w-6 h-6 mb-1 text-neutral-400" />
                    <span>Ảnh 3x4</span>
                  </div>
                )}
              </div>

              {/* Các trường bên cạnh ảnh */}
              <div className="flex-1 space-y-2 text-[13px]">
                {/* Họ tên */}
                <div className="flex items-baseline gap-1.5 border-b border-dotted border-[#A3A3A3] pb-0.5">
                  <span className="text-[#171717] font-medium flex-shrink-0">Họ và tên:</span>
                  <span
                    contentEditable={!readOnly}
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, fullName: val }))
                    }}
                    style={{ fontFamily: 'Dancing Script, cursive' }}
                    className={cn(
                      "text-[#1A365D] font-bold text-[18px] leading-none outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.fullName}
                  </span>
                </div>

                {/* Tên thường gọi */}
                <div className="flex items-baseline gap-1.5 border-b border-dotted border-[#A3A3A3] pb-0.5">
                  <span className="text-[#404040] text-[12px] flex-shrink-0">Tên thường gọi:</span>
                  <span
                    contentEditable={!readOnly}
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, nickname: val }))
                    }}
                    style={{ fontFamily: 'Dancing Script, cursive' }}
                    className={cn(
                      "text-[#1A365D] font-medium text-[16px] leading-none outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.nickname || 'Không'}
                  </span>
                </div>

                {/* Sinh ngày & Giới tính */}
                <div className="grid grid-cols-12 gap-1 border-b border-dotted border-[#A3A3A3] pb-0.5">
                  <div className="col-span-7 flex items-baseline gap-1">
                    <span className="text-[#171717] flex-shrink-0">Sinh ngày:</span>
                    <span
                      contentEditable={!readOnly}
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, dob: val }))
                      }}
                      style={{ fontFamily: 'Dancing Script, cursive' }}
                      className={cn(
                        "text-[#1A365D] font-medium text-[16px] leading-none outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                      )}
                    >
                      {docData.dob}
                    </span>
                  </div>
                  <div className="col-span-5 flex items-baseline gap-1">
                    <span className="text-[#171717] flex-shrink-0">Giới tính:</span>
                    <span
                      contentEditable={!readOnly}
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, gender: val }))
                      }}
                      style={{ fontFamily: 'Dancing Script, cursive' }}
                      className={cn(
                        "text-[#1A365D] font-medium text-[16px] leading-none outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                      )}
                    >
                      {docData.gender || 'Nam'}
                    </span>
                  </div>
                </div>

                {/* Số CMND */}
                <div className="flex items-baseline gap-1.5 border-b border-dotted border-[#A3A3A3] pb-0.5">
                  <span className="text-[#171717] flex-shrink-0">Số CMND:</span>
                  <span
                    contentEditable={!readOnly}
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, cmnd: val }))
                    }}
                    style={{ fontFamily: 'Dancing Script, cursive' }}
                    className={cn(
                      "text-[#1A365D] font-medium text-[16px] leading-none outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.cmnd}
                  </span>
                </div>
              </div>
            </div>

            {/* Các trường thông tin dài (ĐKHKTT, Nơi ở, Nghề nghiệp, SĐT, Hôn nhân, Nhận dạng) */}
            <div className="space-y-2 text-[13px] pt-1">
              {/* Nơi ĐKHKTT */}
              <div className="flex items-baseline gap-1.5 border-b border-dotted border-[#A3A3A3] pb-0.5">
                <span className="text-[#171717] flex-shrink-0">Nơi ĐKHKTT:</span>
                <span
                  contentEditable={!readOnly}
                  suppressContentEditableWarning
                  onBlur={e => {
                    const val = e.currentTarget.textContent || ''
                    onUpdateDoc(docItem.tag_code, prev => ({ ...prev, permanentAddress: val }))
                  }}
                  style={{ fontFamily: 'Dancing Script, cursive' }}
                  className={cn(
                    "text-[#1A365D] font-medium text-[16px] leading-tight outline-none rounded transition-all",
                    highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                  )}
                >
                  {docData.permanentAddress}
                </span>
              </div>

              {/* Nơi ở hiện nay */}
              <div className="flex items-baseline gap-1.5 border-b border-dotted border-[#A3A3A3] pb-0.5">
                <span className="text-[#171717] flex-shrink-0">Nơi ở hiện nay:</span>
                <span
                  contentEditable={!readOnly}
                  suppressContentEditableWarning
                  onBlur={e => {
                    const val = e.currentTarget.textContent || ''
                    onUpdateDoc(docItem.tag_code, prev => ({ ...prev, currentAddress: val }))
                  }}
                  style={{ fontFamily: 'Dancing Script, cursive' }}
                  className={cn(
                    "text-[#1A365D] font-medium text-[16px] leading-tight outline-none rounded transition-all",
                    highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                  )}
                >
                  {docData.currentAddress}
                </span>
              </div>

              {/* Nghề nghiệp & SĐT */}
              <div className="grid grid-cols-12 gap-2 border-b border-dotted border-[#A3A3A3] pb-0.5">
                <div className="col-span-7 flex items-baseline gap-1">
                  <span className="text-[#171717] flex-shrink-0">Nghề nghiệp:</span>
                  <span
                    contentEditable={!readOnly}
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, job: val }))
                    }}
                    style={{ fontFamily: 'Dancing Script, cursive' }}
                    className={cn(
                      "text-[#1A365D] font-medium text-[16px] leading-none outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.job}
                  </span>
                </div>
                <div className="col-span-5 flex items-baseline gap-1">
                  <span className="text-[#171717] flex-shrink-0">SĐT:</span>
                  <span
                    contentEditable={!readOnly}
                    suppressContentEditableWarning
                    onBlur={e => {
                      const val = e.currentTarget.textContent || ''
                      onUpdateDoc(docItem.tag_code, prev => ({ ...prev, phone: val }))
                    }}
                    style={{ fontFamily: 'Dancing Script, cursive' }}
                    className={cn(
                      "text-[#1A365D] font-medium text-[15px] leading-none outline-none rounded transition-all",
                      highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                    )}
                  >
                    {docData.phone}
                  </span>
                </div>
              </div>

              {/* Hôn nhân */}
              <div className="flex items-baseline gap-1.5 border-b border-dotted border-[#A3A3A3] pb-0.5">
                <span className="text-[#171717] flex-shrink-0">Hôn nhân:</span>
                <span
                  contentEditable={!readOnly}
                  suppressContentEditableWarning
                  onBlur={e => {
                    const val = e.currentTarget.textContent || ''
                    onUpdateDoc(docItem.tag_code, prev => ({ ...prev, maritalStatus: val }))
                  }}
                  style={{ fontFamily: 'Dancing Script, cursive' }}
                  className={cn(
                    "text-[#1A365D] font-medium text-[16px] leading-tight outline-none rounded transition-all",
                    highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                  )}
                >
                  {docData.maritalStatus || 'Đã kết hôn'}
                </span>
              </div>

              {/* Đặc điểm nhận diện */}
              <div className="flex items-baseline gap-1.5 border-b border-dotted border-[#A3A3A3] pb-0.5">
                <span className="text-[#171717] flex-shrink-0">Đặc điểm nhận diện:</span>
                <span
                  contentEditable={!readOnly}
                  suppressContentEditableWarning
                  onBlur={e => {
                    const val = e.currentTarget.textContent || ''
                    onUpdateDoc(docItem.tag_code, prev => ({ ...prev, identifyingTraits: val }))
                  }}
                  style={{ fontFamily: 'Dancing Script, cursive' }}
                  className={cn(
                    "text-[#1A365D] font-medium text-[16px] leading-tight outline-none rounded transition-all",
                    highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                  )}
                >
                  {docData.identifyingTraits || 'Cao 1m70, dáng người hơi gầy'}
                </span>
              </div>
            </div>
          </div>

          {/* Dưới cùng bên trái: Trang 1 hoàn toàn sạch sẽ, không hiển thị mã định danh thừa */}
          <div className="relative z-10 px-4 pb-2" />
        </div>

        {/* NỬA PHẢI (TRANG 2) - KHUNG VIỀN ĐÔI MÀU ĐỎ #BA2B27 */}
        <div className="w-[500px] h-[699px] bg-[#FFFDF6] border-[3px] border-[#BA2B27] p-2 relative flex flex-col justify-between">
          {/* Viền chỉ trong mảnh 1px */}
          <div className="absolute inset-[3px] border border-[#BA2B27] pointer-events-none" />

          {/* NỘI DUNG PHẦN TRÊN TRANG 2 */}
          <div className="relative z-10 px-4 pt-3">
            {/* Header Tiêu đề & Phụ đề Vụ án đỏ son #BA2B27 */}
            <div className="text-center mb-6 space-y-0.5">
              <h2 className="font-bold text-[17px] uppercase tracking-[-0.02em] text-[#BA2B27] leading-tight">
                BẢNG TRÍCH LỤC LÝ LỊCH TƯ PHÁP
              </h2>
              <p
                contentEditable={!readOnly}
                suppressContentEditableWarning
                onBlur={e => {
                  const val = e.currentTarget.textContent || ''
                  onUpdateDoc(docItem.tag_code, prev => ({ ...prev, caseSubtitle: val }))
                }}
                className={cn(
                  "font-bold text-[14px] uppercase tracking-tight text-[#BA2B27] outline-none",
                  highlightEditable && "editable-field-indicator bg-amber-500/10 px-1"
                )}
              >
                {caseSubtitle}
              </p>
            </div>

            {/* Các mục 1, 2, 3 */}
            <div className="space-y-4 text-[13.5px] leading-relaxed text-justify text-[#171717]">
              {/* 1. Tiền án, tiền sự */}
              <p>
                <span className="font-bold text-[#171717]">1. Tiền án, tiền sự:</span>{' '}
                <span
                  contentEditable={!readOnly}
                  suppressContentEditableWarning
                  onBlur={e => {
                    const val = e.currentTarget.textContent || ''
                    onUpdateDoc(docItem.tag_code, prev => ({ ...prev, criminalRecord: val }))
                  }}
                  className={cn(
                    "outline-none rounded transition-all",
                    highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                  )}
                >
                  {docData.criminalRecord || 'Tiền án: Không có; Tiền sự: Không có'}
                </span>
              </p>

              {/* 2. Mối quan hệ với nạn nhân */}
              <p>
                <span className="font-bold text-[#171717]">2. Mối quan hệ với nạn nhân:</span>{' '}
                <span
                  contentEditable={!readOnly}
                  suppressContentEditableWarning
                  onBlur={e => {
                    const val = e.currentTarget.textContent || ''
                    onUpdateDoc(docItem.tag_code, prev => ({ ...prev, relationWithVictim: val }))
                  }}
                  className={cn(
                    "outline-none rounded transition-all",
                    highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                  )}
                >
                  {docData.relationWithVictim || 'Em rể'}
                </span>
              </p>

              {/* 3. Hồ sơ lưu trữ */}
              <p>
                <span className="font-bold text-[#171717]">3. Hồ sơ lưu trữ:</span>{' '}
                <span
                  contentEditable={!readOnly}
                  suppressContentEditableWarning
                  onBlur={e => {
                    const val = e.currentTarget.textContent || ''
                    onUpdateDoc(docItem.tag_code, prev => ({ ...prev, archiveNote: val }))
                  }}
                  className={cn(
                    "outline-none rounded transition-all",
                    highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                  )}
                >
                  {archiveNote}
                </span>
              </p>
            </div>
          </div>

          {/* KHỐI CHỨNG NHẬN ĐIỀU TRA (CHUẨN 1:1 THEO BẢN FIGMA MASTER) */}
          <div className="relative z-10 px-4 pb-2">
            {/* Đường kẻ ngang đỏ dày 3px */}
            <div className="w-full h-[3px] bg-[#BA2B27] mb-3" />

            {/* Tiêu đề mục chứng nhận: Đỏ son #BA2B27 */}
            <div className="text-center mb-3">
              <span className="font-bold text-[14px] uppercase tracking-wide text-[#BA2B27]">
                CHỨNG NHẬN CỦA ĐƠN VỊ ĐIỀU TRA / CƠ QUAN CẢNH SÁT
              </span>
            </div>

            {/* Khu vực Ngày tháng & Ký tên */}
            <div className="flex justify-end text-right mb-2">
              <div className="inline-block text-center space-y-1">
                {/* Ngày tháng địa điểm viết tay */}
                <div className="text-[13px] text-[#171717]">
                  <span>{signingCity}, ngày </span>
                  <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-bold text-[17px]">
                    {signingDay}
                  </span>
                  <span> tháng </span>
                  <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-bold text-[17px]">
                    {signingMonth}
                  </span>
                  <span> năm </span>
                  <span style={{ fontFamily: 'Dancing Script, cursive' }} className="text-[#1A365D] font-bold text-[17px]">
                    {signingYear}
                  </span>
                </div>

                <div className="font-bold text-[13px] uppercase tracking-wider text-[#171717]">
                  ĐIỀU TRA VIÊN LẬP TRÍCH LỤC
                </div>
                <div className="text-[11.5px] text-[#555] italic">
                  (Ký, ghi rõ họ tên)
                </div>

                {/* Khoảng trống con dấu / Chữ ký tay */}
                <div className="h-14 flex items-center justify-center relative">
                  {showSeal && (
                    <div
                      style={{
                        transform: `rotate(${sealAngle}deg)`
                      }}
                      className="absolute -top-3 w-20 h-20 rounded-full border-2 border-red-600/70 border-dashed flex items-center justify-center text-[10px] text-red-600/80 font-bold uppercase pointer-events-none select-none opacity-85"
                    >
                      ★ CÔNG AN TP ★
                    </div>
                  )}

                  <span
                    style={{ fontFamily: 'Dancing Script, cursive' }}
                    className="text-[#1A365D] font-bold text-[22px] leading-none pt-2 relative z-10"
                  >
                    {investigatorRankAndName}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Bottom Bar: Thông tin tàng thư góc trái, Pill Tag góc phải */}
            <div className="pt-2 border-t border-neutral-300 flex justify-between items-end text-[12px] text-[#404040]">
              <div className="space-y-0.5 text-left text-[11.5px]">
                <div>Cơ quan CSĐT Công an TP. Hà Nội</div>
                <div>Hồ sơ vụ án: <span className="font-semibold text-[#171717]">{caseFileNumber}</span></div>
                <div>Tình trạng: <span className="italic">{archiveStatus}</span></div>
              </div>

              {/* Tem Tag Code (Pill Tag tròn) góc phải */}
              <div className="bg-[#FAF7EE] border border-black rounded-[90px] px-3.5 py-0.5 text-black font-medium text-[13.5px] leading-tight min-w-[50px] text-center shadow-sm">
                <span
                  contentEditable={!readOnly}
                  suppressContentEditableWarning
                  onBlur={e => {
                    const val = e.currentTarget.textContent || ''
                    onUpdateDoc(docItem.tag_code, prev => ({ ...prev, tagCode: val }))
                  }}
                  className="outline-none font-bold"
                >
                  {docData.tagCode || docItem.tag_code}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
