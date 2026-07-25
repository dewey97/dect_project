'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ScreenHeader } from '@/components/investigation/screen-header'
import { Button } from '@/components/ui/button'
import { getConclusionOptions, getTimelineEvents } from '@/lib/content-service'
import { getActiveCase } from '@/lib/mock-data'
import { useCheckpoints } from '@/components/investigation/checkpoints-context'
import { Lock } from 'lucide-react'
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  UserCheck,
  Zap,
  Hammer,
  FileCheck2,
  Sliders,
  Send,
  Eye,
  Cpu
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ConclusionPage() {
  const router = useRouter()
  const { isConclusionUnlocked } = useCheckpoints()
  const [activeCase, setActiveCase] = useState<any>(null)

  // Options states loaded dynamically from Content Engine
  const [suspects, setSuspects] = useState<any[]>([])
  const [motives, setMotives] = useState<any[]>([])
  const [methods, setMethods] = useState<any[]>([])
  const [evidenceList, setEvidenceList] = useState<any[]>([])

  // Selection States
  const [suspect, setSuspect] = useState<string>('')
  const [motive, setMotive] = useState<string>('')
  const [method, setMethod] = useState<string>('')
  const [timeline, setTimeline] = useState<any[]>([])
  const [attachedEvidence, setAttachedEvidence] = useState<string[]>([])
  const [confidence, setConfidence] = useState<number>(75)

  // View States
  const [showPreview, setShowPreview] = useState(false)
  const [isTransmitting, setIsTransmitting] = useState(false)
  const [transmissionProgress, setTransmissionProgress] = useState(0)

  // Load Content Engine Data
  useEffect(() => {
    async function loadOptions() {
      const currentCase = await getActiveCase()
      if (currentCase) {
        setActiveCase(currentCase)
        const queryId = currentCase.id === 'case-01' ? 'case-001' : currentCase.id
        const options = await getConclusionOptions(queryId)
        const initialTimeline = await getTimelineEvents(queryId)
        if (options) {
          setSuspects(options.suspects)
          setMotives(options.motives)
          setMethods(options.methods)
          setEvidenceList(options.evidenceList)
        }
        if (initialTimeline) {
          setTimeline(initialTimeline)
        }
      }
    }
    loadOptions()
  }, [])

  // Timeline re-order helper (Up/Down arrow sorting)
  function moveTimelineItem(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= timeline.length) return

    const updated = [...timeline]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    setTimeline(updated)
  }

  // Toggle evidence attachment
  function toggleEvidence(id: string) {
    setAttachedEvidence((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Generate dynamic notes summary based on selections
  const suspectName = suspects.find((s) => s.id === suspect)?.name || '[REDACTED SUSPECT]'
  const motiveTitle = motives.find((m) => m.id === motive)?.title || '[REDACTED MOTIVE]'
  const methodTitle = methods.find((m) => m.id === method)?.title || '[REDACTED METHOD]'
  
  const detectiveSummary = `Primary suspect ${suspectName} is suspected of initiating the event via ${methodTitle}, motivated by ${motiveTitle}. Chronological logs track the chain of events starting from the ledger discrepancy to the final pings at Warehouse 12. Supporting forensic evidence attached: ${
    attachedEvidence.length > 0
      ? attachedEvidence.map((id) => evidenceList.find((e) => e.id === id)?.code).join(', ')
      : 'NONE'
  }. Confirmed operator confidence level stands at ${confidence}%.`

  // Handle final submission sequence
  function handleSubmission() {
    setShowPreview(false)
    setIsTransmitting(true)
    setTransmissionProgress(0)

    // Simulate cryptographic transmission progress
    const interval = setInterval(() => {
      setTransmissionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsTransmitting(false)
            router.push('/assistant/conclusion/report')
          }, 1000)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const isConclusionLocked = activeCase ? !isConclusionUnlocked(activeCase.id) : false

  if (isConclusionLocked) {
    return (
      <div className="pb-10 px-4 flex flex-col gap-6">
        <div className="pt-2">
          <button
            onClick={() => router.push('/assistant')}
            className="flex items-center gap-1.5 font-mono text-[0.65rem] text-primary uppercase tracking-wider hover:-translate-x-0.5 active:scale-95 transition-all w-fit animate-fade-in"
          >
            <ArrowLeft className="size-3.5" />
            Back to Assistant
          </button>
        </div>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center text-center p-12 relative overflow-hidden min-h-[350px]">
          <div aria-hidden="true" className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-0" />
          
          <div className="flex size-14 items-center justify-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20 mb-5 z-10 animate-pulse">
            <Lock className="size-7" />
          </div>
          
          <h3 className="font-mono text-sm font-bold text-destructive uppercase tracking-widest z-10 flex items-center gap-1.5">
            KẾT ÁN BỊ KHÓA
          </h3>
          
          <p className="mt-3 text-pretty text-xs text-muted-foreground max-w-[320px] leading-relaxed z-10 font-sans">
            Bạn cần phải hoàn thành tất cả các mục tiêu chặng trong phần <strong>Mục tiêu (Checkpoints)</strong> để có thể tiến hành kết án và nộp báo cáo chính thức.
          </p>

          <button
            onClick={() => router.push('/checkpoints')}
            className="mt-6 font-mono text-xs uppercase tracking-wider border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 px-5 py-2.5 rounded font-bold transition-all z-10 active:scale-95"
          >
            Đi đến Checkpoints
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-10 relative">
      
      {/* Back Button */}
      <div className="px-4 pt-2">
        <button
          onClick={() => router.push('/assistant')}
          className="flex items-center gap-1.5 font-mono text-[0.65rem] text-primary uppercase tracking-wider hover:-translate-x-0.5 active:scale-95 transition-all w-fit"
        >
          <ArrowLeft className="size-3.5" />
          Abort Conclusion
        </button>
      </div>

      <ScreenHeader
        eyebrow="CASE CLOSURE PROTOCOL"
        title="Deduction Report"
        description="Compile and transmit your final forensic report. Review your evidence board game status before locks."
      />

      <div className="flex flex-col gap-6 px-4">
        
        {/* SECTION 1: Primary Suspect */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <UserCheck className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              1. Primary Suspect
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {suspects.map((s) => (
              <label
                key={s.id}
                className={cn(
                  'flex items-center justify-between p-3.5 rounded-lg border bg-card/45 hover:border-primary/20 transition-all cursor-pointer',
                  suspect === s.id ? 'border-primary bg-primary/5' : 'border-border/80'
                )}
              >
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-foreground">{s.name}</span>
                  <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">{s.role}</span>
                </div>
                <input
                  type="radio"
                  name="suspect"
                  checked={suspect === s.id}
                  onChange={() => setSuspect(s.id)}
                  className="size-4 accent-primary cursor-pointer"
                />
              </label>
            ))}
          </div>
        </section>

        {/* SECTION 2: Motive */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Zap className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              2. Motive
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {motives.map((m) => (
              <div
                key={m.id}
                onClick={() => setMotive(m.id)}
                className={cn(
                  'p-3.5 rounded-lg border bg-card/45 hover:border-primary/25 cursor-pointer transition-all',
                  motive === m.id ? 'border-primary bg-primary/5' : 'border-border/80'
                )}
              >
                <span className="block text-xs font-bold text-foreground">{m.title}</span>
                <span className="block text-[0.65rem] text-muted-foreground leading-relaxed mt-1">{m.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: Method */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Hammer className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              3. Method
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {methods.map((m) => (
              <div
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  'p-3.5 rounded-lg border bg-card/45 hover:border-primary/25 cursor-pointer transition-all',
                  method === m.id ? 'border-primary bg-primary/5' : 'border-border/80'
                )}
              >
                <span className="block text-xs font-bold text-foreground">{m.title}</span>
                <span className="block text-[0.65rem] text-muted-foreground leading-relaxed mt-1">{m.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: Timeline Sequence */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Sliders className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              4. Event Timeline Sequence
            </h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {timeline.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card/45 p-3"
              >
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => moveTimelineItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded bg-muted/40 hover:bg-primary/20 text-muted-foreground hover:text-primary border border-border/80 disabled:opacity-20 transition-all duration-150 active:scale-90"
                    aria-label="Move event up"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => moveTimelineItem(index, 'down')}
                    disabled={index === timeline.length - 1}
                    className="p-1 rounded bg-muted/40 hover:bg-primary/20 text-muted-foreground hover:text-primary border border-border/80 disabled:opacity-20 transition-all duration-150 active:scale-90"
                    aria-label="Move event down"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>

                <div className="min-w-0 flex-1 flex gap-2 items-center">
                  <span className="font-mono text-xs font-bold text-primary shrink-0">
                    0{index + 1}
                  </span>
                  <p className="text-xs text-muted-foreground leading-normal">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: Supporting Evidence Checklist */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <FileCheck2 className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              5. Supporting Evidence Log
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {evidenceList.map((e) => (
              <label
                key={e.id}
                className={cn(
                  'flex items-center justify-between p-3.5 rounded-lg border bg-card/45 hover:border-primary/20 transition-all cursor-pointer',
                  attachedEvidence.includes(e.id) ? 'border-primary bg-primary/5' : 'border-border/80'
                )}
              >
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-foreground">{e.title}</span>
                  <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">{e.code}</span>
                </div>
                <input
                  type="checkbox"
                  checked={attachedEvidence.includes(e.id)}
                  onChange={() => toggleEvidence(e.id)}
                  className="size-4 rounded accent-primary cursor-pointer"
                />
              </label>
            ))}
          </div>
        </section>

        {/* SECTION 6: Detective Notes Dynamic Summary (Read-Only) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <FileCheck2 className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              6. Detective Notes Summary
            </h3>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-xs text-muted-foreground leading-relaxed">
            {detectiveSummary}
          </div>
        </section>

        {/* SECTION 7: Confidence Level Slider */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Sliders className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              7. Operator Confidence
            </h3>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4 flex flex-col gap-3">
            <div className="flex justify-between items-baseline font-mono text-xs text-foreground">
              <span>ESTIMATED ASSURANCE:</span>
              <span className="text-primary font-bold">{confidence}%</span>
            </div>
            <input
              type="range"
              min="25"
              max="100"
              step="25"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full accent-primary h-1 bg-muted rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-[0.55rem] font-mono text-muted-foreground px-1">
              <span>25% [SPECULATIVE]</span>
              <span>50%</span>
              <span>75%</span>
              <span>100% [VERIFIED]</span>
            </div>
          </div>
        </section>

        {/* SUBMIT BUTTON */}
        <Button
          onClick={() => setShowPreview(true)}
          disabled={!suspect || !motive || !method}
          size="lg"
          className="h-14 w-full gap-2 mt-4 font-mono text-sm font-bold uppercase tracking-wider disabled:opacity-40 transition-transform active:scale-[0.98]"
        >
          <Eye className="size-4" />
          Review Report Summary
        </Button>
      </div>

      {/* REPORT PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-[26rem] rounded-xl border border-primary/30 bg-card p-5 shadow-[0_0_45px_rgba(199,145,55,0.18)] flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-border pb-2.5">
              <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
                OFFICIAL REPORT PREVIEW
              </span>
              <span className="font-mono text-[0.55rem] text-muted-foreground">DOSSIER // CONFIDENTIAL</span>
            </div>

            <div className="flex flex-col gap-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-2 border-b border-border/10 pb-2.5">
                <div>
                  <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">SUSPECT:</span>
                  <span className="text-foreground font-bold">{suspectName}</span>
                </div>
                <div>
                  <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">CONFIDENCE:</span>
                  <span className="text-primary font-mono font-bold">{confidence}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-border/10 pb-2.5">
                <div>
                  <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">MOTIVE:</span>
                  <span className="text-foreground font-bold">{motiveTitle}</span>
                </div>
                <div>
                  <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">METHOD:</span>
                  <span className="text-foreground font-bold">{methodTitle}</span>
                </div>
              </div>

              <div>
                <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase mb-1">DECIPHERED TIMELINE:</span>
                <ol className="list-decimal pl-4 flex flex-col gap-1 text-[0.7rem] text-muted-foreground leading-relaxed">
                  {timeline.map((t, idx) => (
                    <li key={t.id}>{t.text}</li>
                  ))}
                </ol>
              </div>

              <div className="border-t border-border/20 pt-2.5">
                <span className="block font-mono text-[0.55rem] text-muted-foreground uppercase">ATTACHED PIECES OF EVIDENCE:</span>
                <span className="font-mono text-[0.7rem] text-foreground font-semibold mt-0.5 block">
                  {attachedEvidence.length > 0
                    ? attachedEvidence.map((id) => evidenceList.find((e) => e.id === id)?.code).join(', ')
                    : 'NONE'}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-4 border-t border-border pt-3">
              <Button
                variant="secondary"
                className="flex-1 font-mono text-xs uppercase"
                onClick={() => setShowPreview(false)}
              >
                Back to Draft
              </Button>
              <Button
                className="flex-1 font-mono text-xs uppercase"
                onClick={handleSubmission}
              >
                <Send className="size-3.5 mr-1" />
                Transmit Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ENCRYPTED TRANSMISSION SCREEN OVERLAY */}
      {isTransmitting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6">
          <div aria-hidden="true" className="noir-scanlines pointer-events-none absolute inset-0 opacity-30 z-20" />
          <div className="relative w-full max-w-[22rem] flex flex-col items-center text-center gap-6 animate-crt-flicker">
            
            <div className="flex size-14 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary animate-pulse">
              <Cpu className="size-8" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-mono text-sm font-bold text-foreground uppercase tracking-widest">
                TRANSMITTING REPORT TO HQ
              </h2>
              <span className="font-mono text-[0.6rem] text-muted-foreground uppercase">
                ENCRYPTING WITH MIL-SPEC SHA-256
              </span>
            </div>

            {/* Progress indicator */}
            <div className="w-full flex flex-col gap-2">
              <div className="h-2 w-full rounded-full bg-muted/65 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-100 ease-out"
                  style={{ width: `${transmissionProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-baseline font-mono text-[0.6rem] text-muted-foreground">
                <span>SECTOR ENCRYPTION PROTOCOL</span>
                <span className="text-primary font-bold">{transmissionProgress}%</span>
              </div>
            </div>

            {/* Custom terminal status feedback */}
            <div className="w-full text-left rounded border border-border/80 bg-card/40 p-3 font-mono text-[0.55rem] text-muted-foreground flex flex-col gap-1">
              <span>{`> INITIATING SECURE COM_LINK_UP`}</span>
              {transmissionProgress > 30 && <span>{`> PACKING DEDUCTIVE DOSSIER`}</span>}
              {transmissionProgress > 65 && <span>{`> TRANSMITTING SUSPECT METRIC INDEX`}</span>}
              {transmissionProgress >= 100 && <span className="text-emerald-500 font-bold">{`> SUCCESS // TRANSMISSION VERIFIED`}</span>}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
