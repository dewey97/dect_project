'use client'

import { useState } from 'react'
import { Copy } from 'lucide-react'
import { duplicateCase } from '@/lib/actions/case-actions'

import { toast } from '@/components/ui/toast'

export function DuplicateCaseButton({ caseId }: { caseId: string }) {
  const [isDuplicating, setIsDuplicating] = useState(false)

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    const res = await duplicateCase(caseId)
    if (res.success) {
      toast.success('Nhân bản vụ án thành công!')
    } else {
      toast.error('Failed to duplicate case: ' + res.error)
    }
    setIsDuplicating(false)
  }

  return (
    <button 
      onClick={handleDuplicate}
      disabled={isDuplicating}
      title="Duplicate Case"
      className="p-1.5 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors disabled:opacity-50"
    >
      <Copy className="size-4" />
    </button>
  )
}
