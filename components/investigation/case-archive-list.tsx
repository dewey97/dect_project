'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Case } from '@/lib/types'
import { CaseCard } from './case-card'
import { EmptyState } from './empty-state'
import { FolderOpen, ShieldAlert, KeyRound, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CaseArchiveListProps {
  cases: Case[]
}

export function CaseArchiveList({ cases: initialCases }: CaseArchiveListProps) {
  const router = useRouter()
  
  // Keep cases in local state so the user can simulate activating/unlocking them in the browser!
  const [localCases, setLocalCases] = useState<Case[]>(initialCases)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  
  const [codeAttempt, setCodeAttempt] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  if (!localCases || localCases.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Không có vụ án khả dụng"
        description="Chưa có hồ sơ điều tra nào được phân bổ cho máy trạm của bạn."
      />
    )
  }

  function handleCaseClick(caseFile: Case) {
    if (caseFile.status === 'locked') {
      setSelectedCase(caseFile)
      setCodeAttempt('')
      setIsError(false)
      setIsSuccess(false)
    } else if (caseFile.status === 'active' || caseFile.status === 'solved') {
      // Simulate choosing this case: mark it as active and other cases as locked/solved,
      // and redirect to the evidence locker.
      const updated = localCases.map((c) => {
        if (c.id === caseFile.id) {
          return { ...c, status: 'active' as const }
        }
        if (c.status === 'active') {
          return { ...c, status: 'locked' as const }
        }
        return c
      })
      setLocalCases(updated)
      router.push('/evidence')
    }
  }

  function handleActivation(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCase) return

    // Allow mock activation using the case's code (or case title, or any 4+ char string for easy testing)
    const normalizedAttempt = codeAttempt.trim().toUpperCase()
    const targetCode = selectedCase.code.toUpperCase()

    if (normalizedAttempt === targetCode || normalizedAttempt.length >= 4) {
      setIsSuccess(true)
      setIsError(false)
      setTimeout(() => {
        // Update local cases state to unlock it
        setLocalCases((prev) =>
          prev.map((c) => {
            if (c.id === selectedCase.id) {
              return { ...c, status: 'active', progress: 5 } // start progress at 5%
            }
            // If another case was active, lock it to simulate one active case at a time
            if (c.status === 'active') {
              return { ...c, status: 'locked' }
            }
            return c
          })
        )
        setSelectedCase(null)
        setIsSuccess(false)
        router.push('/evidence')
      }, 1200)
    } else {
      setIsError(true)
    }
  }

  return (
    <div className="flex flex-col gap-3 px-4">
      {localCases.map((caseFile) => (
        <CaseCard
          key={caseFile.id}
          caseFile={caseFile}
          onSelect={() => handleCaseClick(caseFile)}
        />
      ))}

      {/* Premium Activation Dialog / Evidence Locker Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-[24rem] rounded-xl border border-primary/30 bg-card p-5 shadow-[0_0_40px_rgba(199,145,55,0.15)] flex flex-col gap-4 animate-fade-slide-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4.5 text-primary" />
                <span className="font-mono text-xs font-bold text-primary tracking-widest">
                  ỦY QUYỀN TRUY CẬP
                </span>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Folder Identification */}
            <div className="border-l-2 border-primary/60 pl-3 py-1 bg-accent/20 rounded-r-md">
              <span className="font-mono text-[0.6rem] text-muted-foreground uppercase">
                HỒ SƠ MỤC TIÊU SỐ: {selectedCase.code}
              </span>
              <h4 className="font-sans text-sm font-bold text-foreground mt-0.5">
                {selectedCase.title}
              </h4>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Máy trạm này yêu cầu quyền giải mã bảo mật. Nhập mã vụ án từ tài liệu đi kèm hộp game để giải mã hồ sơ vật chứng.
            </p>

            {/* Authorization Code Form */}
            <form onSubmit={handleActivation} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="NX-XXXX"
                  value={codeAttempt}
                  onChange={(e) => {
                    setCodeAttempt(e.target.value.toUpperCase())
                    setIsError(false)
                  }}
                  disabled={isSuccess}
                  className="h-12 w-full rounded-md border border-border bg-background px-4 text-center font-mono text-lg tracking-[0.25em] text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 disabled:opacity-75"
                />
                
                {/* Success Indicator Overlay */}
                {isSuccess && (
                  <div className="absolute inset-0 bg-emerald-500/10 border border-emerald-500 rounded-md flex items-center justify-center text-emerald-500 font-mono text-xs font-bold gap-1.5 animate-pulse">
                    <Check className="size-4 animate-bounce" />
                    ĐÃ CẤP QUYỀN // ĐANG GIẢI MÃ
                  </div>
                )}
              </div>

              {/* Status feedback */}
              {isError && (
                <div className="flex items-center gap-1.5 text-destructive font-mono text-[0.65rem] uppercase">
                  <ShieldAlert className="size-3.5 shrink-0" />
                  <span>Sai mã xác thực giải mã hồ sơ</span>
                </div>
              )}

              {/* Instructions / Demo assist */}
              <div className="rounded bg-muted/40 p-2 border border-border/40 text-[0.6rem] text-muted-foreground font-mono leading-relaxed">
                <span className="font-semibold text-foreground uppercase block mb-0.5">Hỗ trợ máy trạm</span>
                Nhập chính xác mã vụ án (ví dụ: <span className="text-primary font-semibold">{selectedCase.code}</span>) hoặc bất kỳ mã nào từ 4 ký tự để mô phỏng vượt qua.
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 h-10 font-mono text-xs uppercase"
                  onClick={() => setSelectedCase(null)}
                  disabled={isSuccess}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 font-mono text-xs uppercase"
                  disabled={isSuccess || codeAttempt.trim().length < 4}
                >
                  Giải mã hồ sơ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
