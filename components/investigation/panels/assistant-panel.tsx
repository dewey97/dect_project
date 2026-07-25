'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ScreenHeader } from '@/components/investigation/screen-header'
import {
  AssistantMessage,
  DetectiveAction,
  SuggestionChip,
  HintCard,
  EvidenceReference,
  CaseWarning,
  RecoveredInformation,
  SystemAlert
} from '@/components/investigation/assistant-console-components'
import { getAssistantConversation } from '@/lib/content-service'
import { getActiveCase } from '@/lib/mock-data'
import type { AssistantConversation } from '@/lib/types'
import { Shield, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageLog {
  id: string
  type: 'system' | 'assistant' | 'detective' | 'hint' | 'reference' | 'warning' | 'info'
  level?: 1 | 2 | 3
  text?: string
  title?: string
  rows?: { label: string; value: string }[]
  evidenceId?: string
  previewText?: string
}

interface AssistantPanelProps {
  showHeader?: boolean
  className?: string
}

export function AssistantPanel({ showHeader = true, className }: AssistantPanelProps) {
  const router = useRouter()
  const [intel, setIntel] = useState<AssistantConversation | null>(null)
  
  const [messages, setMessages] = useState<MessageLog[]>([
    {
      id: 'init-sys',
      type: 'system',
      text: 'SECURE LINK // COM_CHANNEL_MINH // ESTABLISHED'
    },
    {
      id: 'init-asst',
      type: 'assistant',
      text: 'DETECTIVE. Connecting secure operator coordination log...'
    }
  ])

  const [isTyping, setIsTyping] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<'root' | 'hint1' | 'hint2' | 'hint3' | 'timeline' | 'messages' | 'trace'>('root')
  
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load dynamic content from Content Engine Layer
  useEffect(() => {
    async function loadIntel() {
      const activeCase = await getActiveCase()
      const queryId = activeCase?.id === 'case-01' ? 'case-001' : (activeCase?.id || 'case-001')
      const data = await getAssistantConversation(queryId)
      if (data) {
        setIntel(data)
        setMessages([
          {
            id: 'init-sys',
            type: 'system',
            text: 'SECURE LINK // COM_CHANNEL_MINH // ESTABLISHED'
          },
          {
            id: 'init-asst',
            type: 'assistant',
            text: data.welcomeMessage
          }
        ])
      }
    }
    loadIntel()
  }, [])

  // Auto scroll to bottom when messages or typing state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Triggers simulated typing and replies
  function triggerReply(
    detectiveInput: string,
    newBranch: typeof currentBranch,
    replies: Omit<MessageLog, 'id'>[]
  ) {
    // 1. Add Detective's command
    setMessages((prev) => [
      ...prev,
      { id: `det-${Date.now()}`, type: 'detective', text: detectiveInput }
    ])
    
    setIsTyping(true)

    // 2. Simulate Operator decoding delay
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        ...replies.map((r, idx) => ({
          ...r,
          id: `reply-${Date.now()}-${idx}`
        }))
      ])
      setCurrentBranch(newBranch)
    }, 1000)
  }

  // Handle chip actions
  function handleChipAction(action: string) {
    if (isTyping || !intel) return

    const hint1Obj = intel.hints.find((h) => h.level === 1)
    const hint2Obj = intel.hints.find((h) => h.level === 2)
    const hint3Obj = intel.hints.find((h) => h.level === 3)

    switch (action) {
      case 'root_timeline':
        triggerReply(
          'Reconstruct victim timeline logs',
          'timeline',
          [
            {
              type: 'system',
              text: 'RECONSTRUCTING DATA SECTORS // TIMELINE_DB'
            },
            {
              type: 'info',
              title: intel.timelineInfo.title,
              rows: intel.timelineInfo.rows
            },
            {
              type: 'assistant',
              text: 'Forensic timeline indicates the victim was instructed to meet at 23:41 and discard their device. However, GPS logs place the victim at Warehouse 12 shortly afterward. This implies a diversion.'
            }
          ]
        )
        break

      case 'root_messages':
        triggerReply(
          'Review recovered messages index',
          'messages',
          [
            {
              type: 'reference',
              evidenceId: intel.recoveredMessageRef.evidenceId,
              title: intel.recoveredMessageRef.title,
              previewText: intel.recoveredMessageRef.previewText
            },
            {
              type: 'assistant',
              text: 'This email manifest and message ledger represent the last recorded communication before the victim disappeared. The sender is identified as "The Foreman".'
            }
          ]
        )
        break

      case 'root_hint1':
        triggerReply(
          'Request graded hint // Level 1',
          'hint1',
          [
            {
              type: 'hint',
              level: 1,
              text: hint1Obj?.text || ''
            }
          ]
        )
        break

      case 'need_hint2':
        triggerReply(
          'Request graded hint // Level 2',
          'hint2',
          [
            {
              type: 'hint',
              level: 2,
              text: hint2Obj?.text || ''
            }
          ]
        )
        break

      case 'need_hint3':
        triggerReply(
          'Request graded hint // Level 3',
          'hint3',
          [
            {
              type: 'warning',
              text: 'CRITICAL OPERATION INTELLIGENCE UNLOCKED'
            },
            {
              type: 'hint',
              level: 3,
              text: hint3Obj?.text || ''
            }
          ]
        )
        break

      case 'root_trace':
        triggerReply(
          'Review active Trace intelligence',
          'trace',
          [
            {
              type: 'assistant',
              text: 'Trace intelligence database is online. We have collected profiles on "The Foreman" (T-01) and "Warehouse 12" (T-02). Review the physical trace card markers on your board game matching these codes.'
            }
          ]
        )
        break

      case 'reset_root':
        triggerReply(
          'Return to main protocols',
          'root',
          [
            {
              type: 'assistant',
              text: 'Main directory active. Select your next query protocol.'
            }
          ]
        )
        break

      default:
        break
    }
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {showHeader && (
        <ScreenHeader
          eyebrow="FIELD INTEL COORDINATION"
          title="Assistant Minh"
          description="Review coordinated timelines, attachments, and graded hints."
        />
      )}

      {/* Connection status header bar */}
      <div className="mx-4 mb-3 border border-primary/20 bg-primary/5 rounded-lg p-2.5 flex items-center justify-between font-mono text-[0.6rem] text-primary">
        <div className="flex items-center gap-1.5">
          <Wifi className="size-3.5 animate-pulse" />
          <span>LINK STATUS: SECURE_STABLE</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="size-3.5" />
          <span>SEC // LEVEL II</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-4">
        {messages.map((msg) => {
          if (msg.type === 'system') return <SystemAlert key={msg.id}>{msg.text}</SystemAlert>
          if (msg.type === 'detective') return <DetectiveAction key={msg.id}>{msg.text}</DetectiveAction>
          if (msg.type === 'hint') return <HintCard key={msg.id} level={msg.level || 1} hint={msg.text || ''} />
          if (msg.type === 'reference') return <EvidenceReference key={msg.id} evidenceId={msg.evidenceId || ''} title={msg.title || ''} previewText={msg.previewText || ''} />
          if (msg.type === 'warning') return <CaseWarning key={msg.id}>{msg.text}</CaseWarning>
          if (msg.type === 'info') return <RecoveredInformation key={msg.id} title={msg.title || ''} dataRows={msg.rows || []} />
          return <AssistantMessage key={msg.id}>{msg.text}</AssistantMessage>
        })}

        {/* Typing Loader Indicator */}
        {isTyping && (
          <div className="flex flex-col gap-1 max-w-[85%] self-start bg-card/60 border border-border p-3.5 rounded-r-lg rounded-bl-lg shadow-sm font-mono animate-pulse">
            <span className="text-[0.55rem] text-primary uppercase font-bold tracking-widest flex items-center gap-1">
              <span className="flex size-1.5 bg-primary rounded-full animate-ping" />
              MINH // DECIPHERING DATA...
            </span>
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Bottom Suggestion Action Chips Panel */}
      <div className="border-t border-border bg-background/95 p-3.5 flex flex-col gap-2 mt-auto">
        {currentBranch === 'root' && intel && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {intel.initialChips.map((chip) => (
              <SuggestionChip
                key={chip.action}
                label={chip.label}
                onClick={() => handleChipAction(chip.action)}
                disabled={isTyping}
              />
            ))}
            <div className="md:col-span-2">
              <SuggestionChip
                label="Submit my conclusion"
                onClick={() => router.push('/assistant/conclusion')}
                disabled={isTyping}
                className="border-primary/45 text-primary bg-primary/5 hover:bg-primary/10"
              />
            </div>
          </div>
        )}

        {currentBranch === 'hint1' && (
          <div className="flex flex-col gap-2">
            <SuggestionChip label="Need Level 2 Hint" onClick={() => handleChipAction('need_hint2')} disabled={isTyping} />
            <SuggestionChip label="Return to main protocols" onClick={() => handleChipAction('reset_root')} disabled={isTyping} />
          </div>
        )}

        {currentBranch === 'hint2' && (
          <div className="flex flex-col gap-2">
            <SuggestionChip label="Need Level 3 Hint" onClick={() => handleChipAction('need_hint3')} disabled={isTyping} />
            <SuggestionChip label="Return to main protocols" onClick={() => handleChipAction('reset_root')} disabled={isTyping} />
          </div>
        )}

        {currentBranch === 'hint3' && (
          <div className="flex flex-col gap-2">
            <SuggestionChip label="Return to main protocols" onClick={() => handleChipAction('reset_root')} disabled={isTyping} />
          </div>
        )}

        {(currentBranch === 'timeline' || currentBranch === 'messages' || currentBranch === 'trace') && (
          <div className="flex flex-col gap-2">
            <SuggestionChip label="Return to main protocols" onClick={() => handleChipAction('reset_root')} disabled={isTyping} />
          </div>
        )}
      </div>
    </div>
  )
}
