'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteCase } from '@/lib/actions/case-actions'

import { toast } from '@/components/ui/toast'

export function DeleteCaseButton({ caseId, caseTitle }: { caseId: string, caseTitle: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${caseTitle}"?\nThis action cannot be undone.`)) {
      setIsDeleting(true)
      const res = await deleteCase(caseId)
      if (res.success) {
        toast.success(`Đã xóa vụ án "${caseTitle}" thành công!`)
      } else {
        toast.error('Failed to delete case: ' + res.error)
        setIsDeleting(false)
      }
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete Case"
      className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  )
}
