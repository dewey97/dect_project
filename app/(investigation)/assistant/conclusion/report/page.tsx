'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ScreenHeader } from '@/components/investigation/screen-header'
import { Button } from '@/components/ui/button'
import { getEvaluation, getRewards } from '@/lib/content-service'
import { getActiveCase } from '@/lib/mock-data'
import type { Evaluation, Reward } from '@/lib/types'
import {
  Award,
  FileCheck2,
  ListRestart,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  BookOpen,
  ShieldCheck
} from 'lucide-react'

export default function VictoryReportPage() {
  const router = useRouter()
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [rewards, setRewards] = useState<Reward | null>(null)
  const [selectedAxis, setSelectedAxis] = useState<string>('logic')

  // Load Content Engine Evaluation Data
  useEffect(() => {
    async function loadReport() {
      const activeCase = await getActiveCase()
      const queryId = activeCase?.id === 'case-01' ? 'case-001' : (activeCase?.id || 'case-001')
      const evalData = await getEvaluation(queryId)
      const rewardsData = await getRewards(queryId)
      if (evalData) setEvaluation(evalData)
      if (rewardsData) setRewards(rewardsData)
    }
    loadReport()
  }, [])

  const activeAxisDetails = evaluation?.radarScores.find((a) => a.id === selectedAxis)

  // Radar SVG Math Helpers
  // 5-point radar. Angles: 90 (top), 162, 234, 306, 18.
  // Center is (100, 100). Max radius is 70.
  const center = 100
  const maxR = 70

  const getCoordinates = (index: number, scorePercentage: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2
    const radius = (maxR * scorePercentage) / 100
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)
    return { x, y }
  }

  // Polygon points string calculation
  const pointsStr = evaluation
    ? evaluation.radarScores
        .map((axis, idx) => {
          const { x, y } = getCoordinates(idx, axis.score)
          return `${x},${y}`
        })
        .join(' ')
    : ''

  if (!evaluation || !rewards) {
    return (
      <div className="pb-12 text-center font-mono text-xs text-muted-foreground pt-12">
        LOADING ASSESSMENT REPORT FROM COMMAND...
      </div>
    )
  }

  return (
    <div className="pb-12 animate-fade-slide-up">
      <ScreenHeader
        eyebrow="OFFICIAL HQ REVIEW"
        title="Dossier Assessment"
        description="Investigation Case NX-4471 has been formally closed and evaluated by police command."
      />

      <div className="flex flex-col gap-6 px-4">
        
        {/* 1. OVERALL RESULT STAMP & PROFILE */}
        <div className="rounded-xl border border-border/80 bg-card/40 p-4 flex flex-col gap-4 relative overflow-hidden">
          {/* Stamped Solved Badge with animation */}
          <div className="absolute right-4 top-4 z-20 pointer-events-none select-none">
            <div className="animate-stamp flex flex-col items-center justify-center border-4 border-destructive bg-background/95 px-4 py-1.5 text-destructive rounded font-mono font-black text-xs uppercase tracking-[0.25em] shadow-[0_0_20px_rgba(220,38,38,0.15)]">
              <span>CASE SOLVED</span>
              <span className="text-[0.45rem] font-semibold mt-0.5 opacity-85">HQ EVALUATION</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 max-w-[60%]">
            <span className="font-mono text-[0.6rem] text-primary uppercase tracking-widest font-bold">
              INVESTIGATOR METRICS
            </span>
            <div className="font-mono text-[0.65rem] leading-normal text-muted-foreground flex flex-col gap-1">
              <div>
                <span className="text-muted-foreground">CODENAME:</span>{' '}
                <span className="text-foreground font-semibold">NIGHTJAR</span>
              </div>
              <div>
                <span className="text-muted-foreground">CURRENT RANK:</span>{' '}
                <span className="text-foreground font-semibold">FIELD INVESTIGATOR</span>
              </div>
              <div>
                <span className="text-muted-foreground">CASE FILE:</span>{' '}
                <span className="text-foreground font-semibold">THE HARBOR LIGHTS (NX-4471)</span>
              </div>
              <div>
                <span className="text-muted-foreground">ELAPSED TIME:</span>{' '}
                <span className="text-foreground font-semibold">1H 14M</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. COMPETENCY RADAR CHART (Interactive SVG) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <TrendingUp className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Cognitive Profile Radar
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center rounded-lg border border-border/80 bg-card/30 p-4">
            
            {/* SVG Custom Radar */}
            <div className="flex justify-center">
              <svg className="w-56 h-56" viewBox="0 0 200 200">
                {/* Background grid concentric pentagons */}
                {[20, 40, 60, 80, 100].map((level) => {
                  const pts = Array.from({ length: 5 })
                    .map((_, idx) => {
                      const { x, y } = getCoordinates(idx, level)
                      return `${x},${y}`
                    })
                    .join(' ')
                  return (
                    <polygon
                      key={level}
                      points={pts}
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                  )
                })}

                {/* Axis lines */}
                {Array.from({ length: 5 }).map((_, idx) => {
                  const outer = getCoordinates(idx, 100)
                  return (
                    <line
                      key={idx}
                      x1={center}
                      y1={center}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="var(--border)"
                      strokeWidth="0.5"
                    />
                  )
                })}

                {/* Score Area Polygon */}
                {pointsStr && (
                  <polygon
                    points={pointsStr}
                    fill="color-mix(in oklch, var(--primary) 20%, transparent)"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    className="shadow-sm"
                  />
                )}

                {/* Clickable Axis Interactive nodes */}
                {evaluation.radarScores.map((axis, idx) => {
                  const pos = getCoordinates(idx, axis.score)
                  const isSelected = axis.id === selectedAxis
                  return (
                    <circle
                      key={axis.id}
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 4.5 : 3}
                      fill={isSelected ? 'var(--primary)' : 'var(--muted-foreground)'}
                      stroke="var(--background)"
                      strokeWidth="1"
                      className="cursor-pointer transition-all hover:scale-125"
                      onClick={() => setSelectedAxis(axis.id)}
                    />
                  )
                })}
              </svg>
            </div>

            {/* Radar Detail Card */}
            <div className="flex flex-col gap-2.5 p-3 rounded bg-muted/40 border border-border/60 min-h-[120px] justify-center">
              {activeAxisDetails ? (
                <>
                  <div className="flex justify-between items-baseline font-mono text-[0.625rem] font-bold text-primary">
                    <span className="uppercase">{activeAxisDetails.name}</span>
                    <span>SCORE: {activeAxisDetails.score}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeAxisDetails.desc}
                  </p>
                </>
              ) : (
                <span className="font-mono text-xs text-muted-foreground uppercase text-center block">
                  Select a radar node to inspect
                </span>
              )}
            </div>

          </div>
        </section>

        {/* 3. COGNITIVE SUMMARY */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <BookOpen className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Investigation Summary
            </h3>
          </div>
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="p-3 bg-card/25 rounded border border-border/60">
              <span className="font-mono text-[0.6rem] text-primary uppercase font-bold">STRENGTHS:</span>
              <p className="mt-1 text-muted-foreground">{evaluation.strengths}</p>
            </div>
            <div className="p-3 bg-card/25 rounded border border-border/60">
              <span className="font-mono text-[0.6rem] text-destructive uppercase font-bold">WEAKNESSES:</span>
              <p className="mt-1 text-muted-foreground">{evaluation.weaknesses}</p>
            </div>
            <div className="p-3 bg-card/25 rounded border border-border/60">
              <span className="font-mono text-[0.6rem] text-muted-foreground uppercase font-bold">MISSED EVIDENCE:</span>
              <p className="mt-1 text-muted-foreground">{evaluation.missedEvidence}</p>
            </div>
          </div>
        </section>

        {/* 4. TIMELINE AUDIT */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Timeline Audit
            </h3>
          </div>
          <div className="flex flex-col gap-2 font-mono text-[0.625rem] text-muted-foreground bg-card/20 p-3 rounded border border-border/80 leading-relaxed">
            {evaluation.correctTimeline.map((item, idx) => (
              <div key={idx} className="flex gap-2 text-emerald-500 border-b border-border/10 pb-1.5 last:border-b-0 last:pb-0">
                <span>[CORRECT]</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CUSTODY EVIDENCE LEDGER */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <FileCheck2 className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Evidence Ledger
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center text-[0.6rem] font-mono">
            <div className="p-2.5 rounded bg-emerald-500/5 border border-emerald-500/20 text-emerald-500">
              <span className="block font-bold">USED ({evaluation.evidenceUsage.used.length})</span>
              <span className="block mt-1 text-[0.55rem] text-muted-foreground">{evaluation.evidenceUsage.used.join(', ')}</span>
            </div>
            <div className="p-2.5 rounded bg-muted/30 border border-border/40 text-muted-foreground">
              <span className="block font-bold">IGNORED ({evaluation.evidenceUsage.ignored.length})</span>
              <span className="block mt-1 text-[0.55rem] text-muted-foreground">{evaluation.evidenceUsage.ignored.join(', ')}</span>
            </div>
            <div className="p-2.5 rounded bg-amber-500/5 border border-amber-500/20 text-primary">
              <span className="block font-bold">CRITICAL ({evaluation.evidenceUsage.critical.length})</span>
              <span className="block mt-1 text-[0.55rem] text-muted-foreground">{evaluation.evidenceUsage.critical.join(', ')}</span>
            </div>
          </div>
        </section>

        {/* 6. PROMOTION & REWARDS */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Award className="size-4 text-primary" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Deduction Clearance & Rewards
            </h3>
          </div>
          
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
              <span className="font-sans text-xs font-bold text-foreground">NEW INVESTIGATOR RANK:</span>
              <span className="font-mono text-xs font-bold text-primary">{rewards.newRank}</span>
            </div>

            <div className="flex flex-col gap-1.5 font-mono text-[0.625rem] text-muted-foreground">
              <div className="flex justify-between">
                <span>TRACE CARDS UNLOCKED:</span>
                <span className="text-foreground">{rewards.unlockedTraceCards.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span>INTELLIGENCE CODE FRAGMENT:</span>
                <span className="text-primary font-bold">{rewards.codeFragment}</span>
              </div>
              <div className="flex justify-between">
                <span>NEXT INVESTIGATION PROTOCOL:</span>
                <span className="text-emerald-500">{rewards.nextCaseId.toUpperCase()} ONLINE</span>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIONS PANEL */}
        <div className="flex flex-col gap-2.5 mt-4 border-t border-border pt-4">
          <Button
            onClick={() => router.push('/dashboard')}
            size="lg"
            className="h-12 w-full font-mono text-xs font-bold uppercase tracking-wider gap-1.5"
          >
            <FolderOpen className="size-4" />
            Return to Case Archive
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push('/evidence')}
              className="flex-1 h-11 font-mono text-[0.65rem] uppercase tracking-wider"
            >
              <ListRestart className="size-3.5 mr-1" />
              Replay Case
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard')}
              className="flex-1 h-11 font-mono text-[0.65rem] uppercase tracking-wider text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
            >
              Next Case
              <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
