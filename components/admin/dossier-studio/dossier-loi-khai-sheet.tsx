'use client'

import React, { useMemo } from 'react'
import { MoveUp, MoveDown, Plus, Trash2 } from 'lucide-react'
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
  // Thao tác chỉnh sửa danh sách câu hỏi Q&A (Thêm, Xóa, Đổi vị trí lên/xuống)
  const handleAddQuestion = (targetQaId?: string) => {
    onUpdateDoc(docItem.tag_code, prev => {
      const list = [...(prev.qaList || [])]
      const newQ: QABlock = {
        id: `q_${Date.now()}`,
        question: 'Đề nghị khai báo nội dung câu hỏi...',
        answer: 'Tôi xin khai nhận rằng...'
      }
      if (targetQaId) {
        const idx = list.findIndex(q => q.id === targetQaId)
        if (idx !== -1) {
          list.splice(idx + 1, 0, newQ)
        } else {
          list.push(newQ)
        }
      } else {
        list.push(newQ)
      }
      return { ...prev, qaList: list }
    })
  }

  const handleRemoveQuestion = (targetQaId: string) => {
    onUpdateDoc(docItem.tag_code, prev => ({
      ...prev,
      qaList: (prev.qaList || []).filter(q => q.id !== targetQaId)
    }))
  }

  const handleMoveQuestion = (targetQaId: string, direction: 'up' | 'down') => {
    onUpdateDoc(docItem.tag_code, prev => {
      const list = [...(prev.qaList || [])]
      const idx = list.findIndex(q => q.id === targetQaId)
      if (idx === -1) return prev
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= list.length) return prev

      const temp = list[idx]
      list[idx] = list[targetIdx]
      list[targetIdx] = temp
      return { ...prev, qaList: list }
    })
  }
  // Tính toán trang động dựa trên dung lượng chữ thực tế (Weighted Capacity Pagination)
  // để trang A4/A5 luôn thoáng đẹp, tự động đẩy sang trang mới khi vượt ngưỡng chứ không ép nhồi nhét
  const docPages = useMemo(() => {
    const qaList = docData.qaList || []
    if (!qaList || qaList.length === 0) {
      return [{ pageNumber: 1, items: [], isFirst: true, isLast: true }]
    }

    // Giới hạn chiều cao pixel khả dụng tối đa của Trang 1:
    // A4 portrait: 1123px tổng thể:
    // - Padding trên dưới: 48px (pt-32px pb-16px)
    // - Header hành chính (Tiêu đề, vụ án, cán bộ, lý do, mục Q&A): ~320px
    // - Footer chân trang: ~25px
    // => Chiều cao thực tế khả dụng cho các thẻ Q&A chạm sát mép trên footer là: 1123 - 48 - 320 - 25 = ~730px!
    // Cho phép dung lượng lên đến 765px để tận dụng tối đa từng centimet khoảng trống đáy trang trước khi ngắt!
    const isA4 = docPaper.size === 'A4'
    const isPortrait = docPaper.orientation === 'portrait'

    const maxWeightP1 = isA4 ? (isPortrait ? 765 : 470) : (isPortrait ? 480 : 310)
    const maxWeightNext = isA4 ? (isPortrait ? 980 : 660) : (isPortrait ? 660 : 440)

    // Ước lượng chiều cao pixel thực tế của một card Hỏi & Đáp:
    const calculateQAWeight = (item: QABlock) => {
      const qLen = (item.question || '').length
      const aLen = (item.answer || '').length
      // Base: padding thẻ py-1.5 * 2 + viền border + nhãn: ~32px
      const baseHeightPx = 32
      // Chữ 15.5px EB Garamond: trung bình ~82 ký tự/dòng, line-height 18.5px
      const charsPerLine = isA4 ? (isPortrait ? 82 : 115) : (isPortrait ? 55 : 80)
      const lineHeightPx = isA4 ? (isPortrait ? 18.5 : 16.5) : (isPortrait ? 15.5 : 13.5)
      const qLines = Math.max(1, Math.ceil(qLen / charsPerLine))
      const aLines = Math.max(1, Math.ceil(aLen / charsPerLine))

      // Chiều cao pixel thực tế của khối này (kèm khoảng cách 0px giữa các thẻ)
      return baseHeightPx + (qLines + aLines) * lineHeightPx
    }

    const pages: { pageNumber: number; items: QABlock[]; isFirst: boolean; isLast: boolean }[] = []
    let currentPageItems: QABlock[] = []
    let currentWeight = 0
    let isFirstPage = true

    for (let i = 0; i < qaList.length; i++) {
      const item = qaList[i]
      const weight = calculateQAWeight(item)
      const currentLimit = isFirstPage ? maxWeightP1 : maxWeightNext

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

    if (currentPageItems.length > 0 || pages.length === 0) {
      pages.push({
        pageNumber: pages.length + 1,
        items: currentPageItems,
        isFirst: pages.length === 0,
        isLast: true
      })
    }

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
      {/* Column Header Label / Pill */}
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
              height: docPaper.size === 'A4'
                ? (docPaper.orientation === 'portrait' ? '1123px' : '794px')
                : (docPaper.orientation === 'portrait' ? '794px' : '559px'),
              maxHeight: docPaper.size === 'A4'
                ? (docPaper.orientation === 'portrait' ? '1123px' : '794px')
                : (docPaper.orientation === 'portrait' ? '794px' : '559px')
            }}
            className={cn(
              "print-canvas-lk bg-white shadow-2xl relative select-text text-[#171717] flex flex-col justify-between print-page-break box-border",
              docPaper.size === 'A4' ? "px-[44px] pt-[32px] pb-[16px]" : "px-[28px] pt-[24px] pb-[14px]"
            )}
          >
            <div>
              {page.isFirst ? (
                <>
                  <div className="text-center space-y-1 mb-3.5">
                    <h1
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const val = e.currentTarget.textContent || ''
                        onUpdateDoc(docItem.tag_code, prev => ({ ...prev, docTitle: val }))
                      }}
                      className={cn(
                        "font-bold tracking-[0.05em] uppercase text-[#171717] leading-[1.3] outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1.5 -mx-1.5",
                        docPaper.size === 'A4' ? "text-[23px]" : "text-[19px]"
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
                        "text-[#404040] leading-[1.3] outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1",
                        docPaper.size === 'A4' ? "text-[15.5px]" : "text-[13.5px]"
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
                        "text-[#1A1A1A] leading-[1.25] text-left pt-1 outline-none rounded transition-all",
                        highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1",
                        docPaper.size === 'A4' ? "text-[15px]" : "text-[13px]"
                      )}
                    >
                      {docData.recordLead}
                    </p>
                  </div>

                  {/* Section - Administrative and Officers Info */}
                  <div className={cn(
                    "space-y-1 mb-3.5 text-[#1A1A1A]",
                    docPaper.size === 'A4' ? "text-[15px] leading-[1.32]" : "text-[13px] leading-[1.28]"
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

              {/* Q&A Content Cards (Liền kề nhau, không có khoảng cách gap) */}
              <div className="space-y-0 -space-y-px">
                {page.items.map((item) => {
                  const fullList = docData.qaList || []
                  const globalIndex = fullList.findIndex(q => q.id === item.id)

                  return (
                    <div
                      key={item.id}
                      className="group/qa relative border border-[#E5E5E5] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.02)] first:rounded-t-[4px] last:rounded-b-[4px]"
                    >
                      {/* Hover Action Toolbar: Xếp dọc sang bên phải thẻ Q&A kèm cầu nối hover (Invisible Bridge) */}
                      {!readOnly && (
                        <div className="no-print absolute -right-12 top-0 bottom-0 w-12 z-30 hidden group-hover/qa:flex items-center justify-end pr-1 select-none pointer-events-auto">
                          <div className="flex flex-col items-center gap-1 bg-zinc-900/95 border border-white/20 text-white rounded-md p-1 shadow-2xl backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveQuestion(item.id, 'up')
                              }}
                              disabled={globalIndex <= 0}
                              className="p-1 hover:bg-white/20 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                              title="Di chuyển lên trên"
                            >
                              <MoveUp className="w-3 h-3 text-neutral-300" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveQuestion(item.id, 'down')
                              }}
                              disabled={globalIndex >= fullList.length - 1}
                              className="p-1 hover:bg-white/20 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                              title="Di chuyển xuống dưới"
                            >
                              <MoveDown className="w-3 h-3 text-neutral-300" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddQuestion(item.id)
                              }}
                              className="p-1 hover:bg-emerald-500/30 rounded text-emerald-400 transition-all"
                              title="Chèn thêm câu hỏi mới bên dưới"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveQuestion(item.id)
                              }}
                              className="p-1 hover:bg-red-500/30 rounded text-red-400 transition-all"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    {/* Question Row */}
                    <div className={cn(
                      "bg-[#E5E5E5] px-3.5 py-1.5 text-[#171717] leading-[1.32] text-justify font-normal flex items-start gap-2",
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
                          "outline-none flex-1 min-w-0 rounded transition-all text-justify",
                          highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                        )}
                      >
                        {item.question.replace(/^Hỏi:\s*/i, '')}
                      </div>
                    </div>

                    {/* Answer Row */}
                    <div className={cn(
                      "bg-white px-3.5 py-1.5 text-[#262626] leading-[1.32] text-justify font-normal flex items-start gap-2",
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
                          "outline-none flex-1 min-w-0 rounded transition-all text-justify",
                          highlightEditable && "editable-field-indicator bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-400/40 px-1 -mx-1"
                        )}
                      >
                        {item.answer.replace(/^Đáp:\s*/i, '')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

            {/* Bottom Footer Section (Không đường kẻ line, đẩy sát mép đáy) */}
            <div className="pt-2 pb-0 mt-auto flex justify-between items-center text-[12px] text-neutral-500">
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
