'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createCaseDraft } from '@/lib/actions/case-actions'
import { useRouter } from 'next/navigation'

export function CreateCaseButton() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    setIsPending(true)
    const res = await createCaseDraft('Mật vụ mới (Bản nháp)')
    if (res.success && res.data) {
      router.push(`/studio/cases/${res.data.id}/overview`)
    } else {
      console.error(res.error)
      setIsPending(false)
    }
  }

  return (
    <button 
      onClick={handleCreate}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 font-medium rounded-md hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus className="size-4" />
      {isPending ? 'Creating...' : 'Create New Case'}
    </button>
  )
}
