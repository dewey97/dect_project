'use client'

import { useState, useEffect } from 'react'
import { HelpCircle, User, MapPin, Package, Clock, LayoutGrid, CalendarRange } from 'lucide-react'
import type { TraceCard } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ScreenHeader } from '@/components/investigation/screen-header'
import { getActiveCase, getTraceCards } from '@/lib/mock-data'
import { TimelineTool } from '@/components/investigation/timeline-tool'

const CATEGORY_ICON: Record<TraceCard['category'], typeof User> = {
  suspect: User,
  location: MapPin,
  object: Package,
  event: Clock,
}

function TraceTile({ card }: { card: TraceCard }) {
  const Icon = card.collected ? CATEGORY_ICON[card.category] : HelpCircle
  return (
    <article
      className={cn(
        'relative flex flex-col rounded-lg border p-4',
        card.collected
          ? 'border-border bg-card'
          : 'border-dashed border-border bg-card/40',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="label-system">{card.code}</span>
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-md',
            card.collected ? 'bg-primary/15 text-primary' : 'bg-accent text-muted-foreground',
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <h2 className="mt-3 text-sm font-semibold leading-tight">
        {card.collected ? card.name : 'Chưa thu thập'}
      </h2>
      <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
        {card.collected ? card.description : 'Hãy tìm kiếm manh mối này trong quá trình phá án.'}
      </p>
    </article>
  )
}

export default function TracePage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'cards'>('timeline')
  const [cards, setCards] = useState<TraceCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const activeCase = await getActiveCase()
        if (activeCase) {
          const fetchedCards = await getTraceCards(activeCase.id)
          setCards(fetchedCards)
        }
      } catch (err) {
        console.error('Failed to load trace cards', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const collectedCount = cards.filter((c) => c.collected).length

  return (
    <div className="pb-6">
      <ScreenHeader
        eyebrow="Trung Tâm Lập Luận"
        title="Lập Luận & Trace"
        description="Sắp đặt dòng thời gian ngoại phạm và tích lũy các thẻ Trace thu giữ được."
      />

      <div className="px-4 flex flex-col gap-4">
        {/* Tab Selector Segment */}
        <div className="flex border-b border-border/60">
          <button
            onClick={() => setActiveTab('timeline')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase border-b-2 transition-all cursor-pointer",
              activeTab === 'timeline'
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarRange className="size-4" /> Dòng thời gian ngoại phạm
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase border-b-2 transition-all cursor-pointer",
              activeTab === 'cards'
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-4" /> Kho thẻ Trace ({collectedCount}/{cards.length})
          </button>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'timeline' ? (
          <TimelineTool />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <span className="label-system">Thẻ Trace đã thu thập</span>
              <span className="font-mono text-sm">
                <span className="text-primary">{collectedCount}</span>
                <span className="text-muted-foreground"> / {cards.length}</span>
              </span>
            </div>

            {loading ? (
              <p className="font-mono text-xs text-muted-foreground text-center py-6">Đang tải thẻ bài...</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {cards.map((card) => (
                  <TraceTile key={card.id} card={card} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
