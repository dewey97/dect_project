'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { LoiKhaiData, PaperConfig, QABlock } from '@/types/dossier'
import type { DbDossierDocument } from '@/lib/actions/dossier-actions'

interface DossierLoiKhaiSheetProps {
  docItem: DbDossierDocument
  docData: LoiKhaiData
  docPaper: PaperConfig
  isSelected?: boolean
  highlightEditable?: boolean
  canMoveLeft?: boolean
  canMoveRight?: boolean
  onMoveLeft?: () => void
  onMoveRight?: () => void
  onSelect?: () => void
  onUpdateDoc?: (tagCode: string, updater: (prev: LoiKhaiData) => LoiKhaiData) => void
  readOnly?: boolean
}

export function DossierLoiKhaiSheet({
  docItem,
  docData,
  docPaper,
  isSelected = false,
  highlightEditable = false,
  canMoveLeft = false,
  canMoveRight = false,
  onMoveLeft,
  onMoveRight,
  onSelect = () => {},
  onUpdateDoc = () => {},
  readOnly = false
}: DossierLoiKhaiSheetProps) {
  // Tính toán trang động dựa trên dung lượng chữ thực tế (Weighted Capacity Pagination)
  // để trang A4/A5 luôn thoáng đẹp, tự động đẩy sang trang mới khi vượt ngưỡng chứ không ép nhồi nhét
  const docPages = useMemo(() => {
    const qaList = docData.qaList || []
    if (!qaList || qaList.length === 0) {
      return [{ pageNumber: 1, items: [], isFirst: true, isLast: true }]
    }

    // Giới hạn chiều cao pixel khả dụng tối đa trước khi bắt buộc phải ngắt trang:
    // A4 portrait: 1123px tổng thể, padding trên dưới 110px, footer 70px -> còn lại: ~940px.
    // - Trang 1: Phần header hành chính chiếm ~260px -> khả dụng cho Q&A: ~680px
    // - Trang tiếp theo: Header phụ chiếm ~45px -> khả dụng cho Q&A: ~890px
    const isA4 = docPaper.size === 'A4'
    const isPortrait = docPaper.orientation === 'portrait'

    const maxWeightP1 = isA4 ? (isPortrait ? 680 : 380) : (isPortrait ? 420 : 250)
    const maxWeightNext = isA4 ? (isPortrait ? 890 : 540) : (isPortrait ? 580 : 350)

    // Ước lượng chiều cao pixel thực tế của một card Hỏi & Đáp:
    const calculateQAWeight = (item: QABlock) => {
      const qLen = (item.question || '').length
      const aLen = (item.answer || '').length
      // Base: padding thẻ + viền border + nhãn Hỏi/Đáp: ~48px
      const baseHeightPx = 48
      // Chữ 15.5px EB Garamond: trung bình ~78 ký tự/dòng, line-height 20px
      const charsPerLine = isA4 ? (isPortrait ? 78 : 110) : (isPortrait ? 52 : 78)
      const lineHeightPx = isA4 ? (isPortrait ? 20 : 18) : (isPortrait ? 17 : 15)
      const qLines = Math.max(1, Math.ceil(qLen / charsPerLine))
      const aLines = Math.max(1, Math.ceil(aLen / charsPerLine))

      // Chiều cao pixel thực tế của khối này (kèm margin-bottom 12px)
      return baseHeightPx + (qLines + aLines) * lineHeightPx + 12
    }

    const pages: { pageNumber: number; items: QABlock[]; isFirst: boolean; isLast: boolean }[] = []
    let currentPageItems: QABlock[] = []
    let currentWeight = 0
    let isFirstPage = true

    for (let i = 0; i < qaList.length; i++) {
      const item = qaList[i]
      const weight = calculateQAWeight(item)
      const currentLimit = isFirstPage ? maxWeightP1 : maxWeightNext

      // Nếu thêm câu này mà vượt quá tải trọng của trang hiện tại (và trang hiện tại đã có ít nhất 1 câu)
      // thì ngắt trang ngay lập tức để trang không bị tràn layout!
      if (currentPageItems.length > 0 && currentWeight + weight > currentLimit) {
        pages.push({
          pageNumber: pages.length + 1,
          items: currentPageItems,
          isFirst: isFirstPage,
          isLast: false
        })
        currentPageItems = [item]
        currentWeight = weight
        isFirstPage = false
      } else {
        currentPageItems.push(item)
        currentWeight += weight
      }
    }

    // Đẩy trang cuối cùng vào danh sách
    if (currentPageItems.length > 0 || pages.length === 0) {
      pages.push({
        pageNumber: pages.length + 1,
        items: currentPageItems,
        isFirst: pages.length === 0,
        isLast: true
      })
    }

    // Đảm bảo cờ isLast của trang cuối luôn đúng
    if (pages.length > 0) {
      pages[pages.length - 1].isLast = true
    }

    return pages
  }, [docData.qaList, docPaper.size, docPaper.orientation])

  return (
    <div
      id={`doc-sheet-${docItem.tag_code}`}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-8 transition-all",
        !readOnly && "cursor-pointer group p-3 rounded-2xl border-2",
        !readOnly && (isSelected
          ? "border-amber-500/80 bg-amber-500/5 shadow-2xl ring-4 ring-amber-500/10"
          : "border-transparent hover:border-white/20 hover:bg-white/[0.02]"
        )
      )}
    >
      {/* Column Header Label / Pill & Reorder Buttons */}
      {!readOnly && (
        <div className="flex items-center justify-between w-full px-2 py-1 text-xs">
          <div className="flex items-center gap-2">
            {/* Nút Đẩy Trái / Đẩy Phải */}
            <div className="flex items-center bg-black/60 rounded-md border border-white/10 p-0.5">
            <button
              type="button"
              disabled={!canMoveLeft}
              onClick={(e) => {
                e.stopPropagation()
                onMoveLeft?.()
              }}
              title="Đẩy sang trái (Di chuyển hồ sơ lên trước)"
              className={cn(
                "p-1 rounded transition-all",
                canMoveLeft
                  ? "text-neutral-300 hover:text-white hover:bg-white/15 active:scale-95"
                  : "text-neutral-600 cursor-not-allowed opacity-40"
              )}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              disabled={!canMoveRight}
              onClick={(e) => {
                e.stopPropagation()
                onMoveRight?.()
              }}
              title="Đẩy sang phải (Di chuyển hồ sơ về sau)"
              className={cn(
                "p-1 rounded transition-all",
                canMoveRight
                  ? "text-neutral-300 hover:text-white hover:bg-white/15 active:scale-95"
                  : "text-neutral-600 cursor-not-allowed opacity-40"
              )}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <span
            className={cn(
              "font-mono font-bold px-2 py-0.5 rounded text-[11px]",
              isSelected ? "bg-amber-500 text-black font-extrabold" : "bg-zinc-800 text-zinc-300"
            )}
          >
            {docItem.tag_code}
          </span>
          <span className="font-semibold text-zinc-200 text-sm max-w-[160px] truncate">
            {docData.subjectName || docItem.subject_name}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono">
          {docPages.length} trang
        </span>
      </div>
      )}

      {/* Vertical Stack of Pages for this Document */}
      <div className="flex flex-col items-center gap-10">
        {docPages.map((page) => (
          <div
            key={`doc_${docItem.tag_code}_page_${page.pageNumber}`}
            style={{
              fontFamily: 'EB Garamond, serif',
              width: docPaper.size === 'A4'
                ? (docPaper.orientation === 'portrait' ? '794px' : '1123px')
                : (docPaper.orientation === 'portrait' ? '559px' : '794px'),
              minHeight: docPaper.size === 'A4'
                ? (docPaper.orientation === 'portrait' ? '1123px' : '794px')
                : (docPaper.orientation === 'portrait' ? '794px' : '559px')
            }}
            className={cn(
              "print-canvas-lk bg-white shadow-2xl relative select-text text-[#171717] flex flex-col justify-between print-page-break",
              docPaper.size === 'A4' ? "p-[55px]" : "p-[35px]"
            )}
          >
            <div>
              {page.isFirst ? (
                <>
                  <div className="text-center space-y-1.5 mb-5">
                    <h1
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, docTitle: val }))
                      }}
                      className={cn(
                        "font-bold tracking-[0.05em] uppercase text-[#171717] leading-[1.33] outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1.5 -mx-1.5",
                        docPaper.size === 'A4' ? "text-[24px]" : "text-[20px]"
                      )}
                    >
                      {docData.docTitle || 'BIÊN BẢN GHI LỜI KHAI'}
                    </h1>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, caseSubtitle: val }))
                      }}
                      className={cn(
                        "text-[#404040] leading-[1.37] outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1",
                        docPaper.size === 'A4' ? "text-[16px]" : "text-[14px]"
                      )}
                    >
                      {docData.caseSubtitle}
                    </p>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, recordLead: val }))
                      }}
                      className={cn(
                        "text-[#1A1A1A] leading-[1.27] text-left pt-1.5 outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1",
                        docPaper.size === 'A4' ? "text-[15.5px]" : "text-[13.5px]"
                      )}
                    >
                      {docData.recordLead}
                    </p>
                  </div>

                  {/* Section - Administrative and Officers Info */}
                  <div className={cn(
                    "space-y-1.5 mb-5 text-[#1A1A1A]",
                    docPaper.size === 'A4' ? "text-[15.5px] leading-[1.37]" : "text-[13.5px] leading-[1.3]"
                  )}>
                    {/* CHÚNG TÔI GỒM: khối điều tra viên và người được lấy lời khai thụt lề pl-4 */}
                    <div className="space-y-1">
                      <div className="font-bold uppercase tracking-[0.02em] text-[#171717]">
                        CHÚNG TÔI GỒM:
                      </div>
                      <div className="pl-4 space-y-1">
                        <div>
                          <span>Điều tra viên: </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={e => {
                              const val = e.currentTarget.textContent || ''
                              onUpdateDoc(docItem.tag_code, prev => ({ ...prev, investigatorText: val }))
                            }}
                            className={cn(
                              "outline-none rounded transition-all",
                              highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                            )}
                          >
                            {docData.investigatorText}
                          </span>
                        </div>
                        <div>
                          <span>Người được lấy lời khai: </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={e => {
                              const val = e.currentTarget.textContent || ''
                              onUpdateDoc(docItem.tag_code, prev => ({ ...prev, subjectName: val }))
                            }}
                            className={cn(
                              "font-bold text-[#171717] outline-none rounded transition-all",
                              highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                            )}
                          >
                            {docData.subjectName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lý do lấy lời khai & Mối quan hệ: Căn thẳng hàng lề gốc với "CHÚNG TÔI GỒM:" */}
                    <div className="space-y-1.5 pt-1">
                      <div>
                        <span className="font-bold tracking-[0.02em] uppercase text-[#262626]">
                          Lý do lấy lời khai:{' '}
                        </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => {
                            const val = e.currentTarget.textContent || ''
                            onUpdateDoc(docItem.tag_code, prev => ({ ...prev, reasonText: val }))
                          }}
                          className={cn(
                            "text-[#171717] outline-none rounded transition-all",
                            highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                          )}
                        >
                          {docData.reasonText}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold tracking-[0.02em] uppercase text-[#262626]">
                          Mối quan hệ với nạn nhân:{' '}
                        </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => {
                            const val = e.currentTarget.textContent || ''
                            onUpdateDoc(docItem.tag_code, prev => ({ ...prev, relationText: val }))
                          }}
                          className={cn(
                            "text-[#171717] outline-none rounded transition-all",
                            highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                          )}
                        >
                          {docData.relationText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section Title Header */}
                  <div className="mb-3.5 pb-1 border-b-2 border-[#262626]">
                    <h2 className={cn(
                      "font-bold uppercase tracking-[0.04em] text-[#171717]",
                      docPaper.size === 'A4' ? "text-[16px]" : "text-[14px]"
                    )}>
                      NỘI DUNG LỜI KHAI (HỎI VÀ ĐÁP)
                    </h2>
                  </div>
                </>
              ) : (
                <div className="mb-4 pb-2 border-b border-[#262626]/20 flex justify-between items-baseline text-neutral-500">
                  <span className="text-[12px] uppercase font-bold tracking-wider text-[#171717]">
                    {docData.docTitle} (TIẾP THEO)
                  </span>
                  <span className="text-[11px] font-mono">
                    Trang {page.pageNumber}/{docPages.length}
                  </span>
                </div>
              )}

              {/* Q&A Content Cards */}
              <div className="space-y-3">
                {page.items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-[4px] border border-[#E5E5E5] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                  >
                    {/* Question Row */}
                    <div className={cn(
                      "bg-[#E5E5E5] border-l-2 border-[#262626] px-4 py-2 text-[#171717] leading-[1.35] text-justify font-normal flex items-start gap-2",
                      docPaper.size === 'A4' ? "text-[15.5px]" : "text-[13.5px]"
                    )}>
                      {/* Cụm nhãn: "Hỏi" căn lề trái, dấu ":" dóng thẳng đứng tuyệt đối */}
                      <div className="font-bold select-none flex-shrink-0 flex items-center justify-between w-9" contentEditable={false}>
                        <span>Hỏi</span>
                        <span>:</span>
                      </div>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const val = e.currentTarget.textContent || ''
                          onUpdateDoc(docItem.tag_code, prev => ({
                            ...prev,
                            qaList: (prev.qaList || []).map(q => q.id === item.id ? { ...q, question: val } : q)
                          }))
                        }}
                        className={cn(
                          "outline-none flex-1 min-w-0 rounded transition-all text-left",
                          highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                        )}
                      >
                        {item.question.replace(/^Hỏi:\s*/i, '')}
                      </div>
                    </div>

                    {/* Answer Row */}
                    <div className={cn(
                      "bg-white border-l-2 border-[#262626] px-4 py-2.5 text-[#262626] leading-[1.35] text-justify font-normal flex items-start gap-2",
                      docPaper.size === 'A4' ? "text-[15.5px]" : "text-[13.5px]"
                    )}>
                      {/* Cụm nhãn: "Đáp" căn lề trái, dấu ":" dóng thẳng đứng tuyệt đối */}
                      <div className="font-bold select-none flex-shrink-0 flex items-center justify-between w-9" contentEditable={false}>
                        <span>Đáp</span>
                        <span>:</span>
                      </div>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const val = e.currentTarget.textContent || ''
                          onUpdateDoc(docItem.tag_code, prev => ({
                            ...prev,
                            qaList: (prev.qaList || []).map(q => q.id === item.id ? { ...q, answer: val } : q)
                          }))
                        }}
                        className={cn(
                          "outline-none flex-1 min-w-0 rounded transition-all text-left",
                          highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                        )}
                      >
                        {item.answer.replace(/^Đáp:\s*/i, '')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Footer Section */}
            <div className="pt-6 border-t border-neutral-200/60 mt-6 flex justify-between items-center text-[12px] text-neutral-500">
              <span className="font-mono">
                Trang {page.pageNumber} / {docPages.length}
              </span>

              <div className={cn(
                "bg-[#D9D9D9] border border-black rounded-[90px] px-3.5 py-0.5 text-black font-medium text-[15px] leading-tight min-w-[50px] text-center transition-all",
                highlightEditable && "editable-field-indicator ring-2 ring-amber-400 ring-offset-2 ring-offset-white"
              )}>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                    const val = e.currentTarget.textContent || ''
                    onUpdateDoc(docItem.tag_code, prev => ({ ...prev, tagCode: val }))
                  }}
                  className="outline-none font-medium"
                >
                  {docData.tagCode || docItem.tag_code}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
