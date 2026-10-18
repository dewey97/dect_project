'use client'

import React from 'react'
import type { DbDossierDocument } from '@/lib/actions/dossier-actions'
import type { LoiKhaiData, LyLichData } from '@/types/dossier'
import { DossierLoiKhaiSheet } from '@/components/admin/dossier-studio/dossier-loi-khai-sheet'
import { DossierLyLichSheet } from '@/components/admin/dossier-studio/dossier-ly-lich-sheet'

interface DiegeticDossierSheetProps {
  document: DbDossierDocument
  className?: string
  scale?: number
}

/**
 * Tái sử dụng 100% component gốc từ Dossier Studio:
 * - DossierLoiKhaiSheet (chuẩn phân trang, dóng lề, căn dấu ':' và typography)
 * - DossierLyLichSheet (chuẩn bố cục ảnh thẻ 3x4, con dấu mộc, chữ ký tay)
 * Không vẽ lại, không clone code!
 */
export function DiegeticDossierSheet({
  document: docItem,
  className,
  scale = 1
}: DiegeticDossierSheetProps) {
  const isLoiKhai = docItem.mode === 'loi_khai'
  const paperConfig = docItem.paper_config || {
    size: 'A4',
    orientation: isLoiKhai ? 'portrait' : 'landscape'
  }

  return (
    <div
      className={className}
      style={scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: 'top center' } : undefined}
    >
      {isLoiKhai ? (
        <DossierLoiKhaiSheet
          docItem={docItem}
          docData={docItem.content as LoiKhaiData}
          docPaper={paperConfig}
          readOnly={true}
          isSelected={false}
          highlightEditable={false}
        />
      ) : (
        <DossierLyLichSheet
          docItem={docItem}
          docData={docItem.content as LyLichData}
          docPaper={paperConfig}
          readOnly={true}
          isSelected={false}
          highlightEditable={false}
          showSeal={true}
        />
      )}
    </div>
  )
}
