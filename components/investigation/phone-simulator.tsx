'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Device, Conversation, Photo, Email, Document, BrowserHistory, RecoveredFile } from '@/lib/types'
import {
  MessageSquare,
  Phone,
  Users,
  Image as ImageIcon,
  Mail,
  FileText,
  Mic,
  FolderOpen,
  Calendar,
  Globe,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { IPhoneFrame } from './iphone/iphone-frame'
import { Smartphone, Terminal } from 'lucide-react'

// Import Reusable Evidence Viewers
import { EvidenceHeader } from './viewers/evidence-header'
import { MetadataPanel } from './viewers/metadata-panel'
import { ConversationViewer } from './viewers/conversation-viewer'
import { PhotoGallery } from './viewers/photo-gallery'
import { EmailViewer } from './viewers/email-viewer'
import { DocumentViewer } from './viewers/document-viewer'
import { TimelineViewer } from './viewers/timeline-viewer'
import { FileExplorer } from './viewers/file-explorer'
import { RecoveryStatusPanel } from './viewers/recovery-status-panel'
import { IntegrityIndicator } from './viewers/integrity-indicator'

interface PhoneSimulatorProps {
  device: Device
  threads: Conversation[]
  photos: Photo[]
  emails: Email[]
  notes: Document[]
  history: BrowserHistory[]
  files: RecoveredFile[]
}

type ActiveApp =
  | 'messages'
  | 'calls'
  | 'contacts'
  | 'photos'
  | 'emails'
  | 'notes'
  | 'voicemails'
  | 'files'
  | 'calendar'
  | 'browser'
  | null

export function PhoneSimulator({
  device,
  threads,
  photos,
  emails,
  notes,
  history,
  files
}: PhoneSimulatorProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'iphone' | 'forensics'>('iphone')
  const [activeApp, setActiveApp] = useState<ActiveApp>(null)

  // Forensic Application List configuration
  const APP_CONFIG = [
    { id: 'messages' as const, label: 'Tin nhắn', icon: MessageSquare, progress: 98, hasData: threads.length > 0 },
    { id: 'calls' as const, label: 'Nhật ký cuộc gọi', icon: Phone, progress: 0, hasData: false },
    { id: 'contacts' as const, label: 'Danh bạ', icon: Users, progress: 0, hasData: false },
    { id: 'photos' as const, label: 'Thư viện ảnh', icon: ImageIcon, progress: 72, hasData: photos.length > 0 },
    { id: 'emails' as const, label: 'Email', icon: Mail, progress: 91, hasData: emails.length > 0 },
    { id: 'notes' as const, label: 'Ghi chú', icon: FileText, progress: 85, hasData: notes.length > 0 },
    { id: 'voicemails' as const, label: 'Hộp thư thoại', icon: Mic, progress: 0, hasData: false },
    { id: 'files' as const, label: 'Tệp tin', icon: FolderOpen, progress: 80, hasData: files.length > 0 },
    { id: 'calendar' as const, label: 'Lịch', icon: Calendar, progress: 0, hasData: false },
    { id: 'browser' as const, label: 'Trình duyệt', icon: Globe, progress: 95, hasData: history.length > 0 },
  ]

  const activeAppConfig = APP_CONFIG.find((a) => a.id === activeApp)

  const APP_TRANSLATIONS: Record<string, string> = {
    messages: 'TIN_NHẮN',
    photos: 'THƯ_VIỆN_ẢNH',
    emails: 'EMAIL',
    notes: 'GHI_CHÚ',
    browser: 'TRÌNH_DUYỆT',
    files: 'TỆP_TIN'
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-10">
      
      {/* Return Navigation & View Mode Toggle */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => router.push('/evidence')}
          className="flex items-center gap-1.5 font-mono text-[0.65rem] text-primary uppercase tracking-wider hover:-translate-x-0.5 active:scale-95 transition-all w-fit"
        >
          <ArrowLeft className="size-3.5" />
          Quay lại Phòng Lab Bằng Chứng
        </button>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-card/60 border border-border p-1 rounded-lg">
          <button
            onClick={() => setViewMode('iphone')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all',
              viewMode === 'iphone'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Smartphone className="size-3.5" />
            <span>Mô phỏng iPhone</span>
          </button>
          <button
            onClick={() => setViewMode('forensics')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all',
              viewMode === 'forensics'
                ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Terminal className="size-3.5" />
            <span>Bảng Phục Hồi Pháp Y</span>
          </button>
        </div>
      </div>

      {/* 1. Evidence Header */}
      <EvidenceHeader device={device} />

      {/* 2. MAIN WORKSPACE */}
      {viewMode === 'iphone' ? (
        <IPhoneFrame
          device={device}
          threads={threads}
          photos={photos}
          notes={notes}
          history={history}
          files={files}
          onSwitchToForensics={() => setViewMode('forensics')}
        />
      ) : (
        <>
          {/* Metadata Panel (only shown at root grid list) */}
          {!activeApp && <MetadataPanel device={device} />}

          {/* Reconstructed Screen Workspace */}
          <div className="min-h-[380px] rounded-xl border border-border bg-card/30 flex flex-col overflow-hidden relative">
        
        {/* CRT scan-line overlay */}
        <div aria-hidden="true" className="noir-scanlines pointer-events-none absolute inset-0 opacity-25 z-20" />

        {/* Workspace Title Bar */}
        <div className="bg-muted/40 border-b border-border px-4 py-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs font-bold text-foreground uppercase tracking-widest">
              {activeApp ? `PHỤC_HỒI_PHÁP_Y // ${APP_TRANSLATIONS[activeApp] || activeApp.toUpperCase()}` : 'ẢNH_ĐĨA_THU_THẬP // TRANG CHỦ'}
            </span>
          </div>
          {activeApp && (
            <button
              onClick={() => setActiveApp(null)}
              className="flex items-center gap-1 font-mono text-[0.6rem] text-primary uppercase tracking-widest border border-primary/20 bg-primary/5 rounded px-2 py-0.5 hover:bg-primary/10"
            >
              <ArrowLeft className="size-3 shrink-0" /> Đóng
            </button>
          )}
        </div>

        {/* Dynamic Display Area */}
        <div className="flex-1 p-4 relative z-10 animate-crt-flicker flex flex-col overflow-y-auto gap-4">
          
          {/* ROOT SCREEN: App Grid */}
          {!activeApp && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {APP_CONFIG.map((app) => {
                const Icon = app.icon
                return (
                  <button
                    key={app.id}
                    onClick={() => setActiveApp(app.id)}
                    className={cn(
                      'group relative flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card/40 transition-all duration-150',
                      'hover:-translate-y-0.5 hover:border-primary/30 active:translate-y-0',
                      !app.hasData && 'opacity-55'
                    )}
                  >
                    <Icon className="size-7 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-sans text-xs font-bold text-foreground mt-2 truncate w-full text-center">
                      {app.label}
                    </span>
                    <span className={cn(
                      'font-mono text-[0.55rem] mt-1.5 px-1 rounded-sm border',
                      app.progress > 0 
                        ? 'text-primary border-primary/20 bg-primary/5'
                        : 'text-muted-foreground border-border bg-muted/20'
                    )}>
                      {app.progress > 0 ? `KHÔI PHỤC: ${app.progress}%` : 'BỊ HỎNG'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* ACTIVE RECONSTRUCTED APP WORKSPACE (Stacks Layout Sequence) */}
          {activeApp && (
            <div className="flex-1 flex flex-col gap-4">
              
              {/* LAYOUT LAYER 3: Recovered Content Viewer */}
              <div className="flex-1 flex flex-col">
                {activeApp === 'messages' && (
                  <ConversationViewer threads={threads} />
                )}
                {activeApp === 'photos' && (
                  <PhotoGallery photos={photos} />
                )}
                {activeApp === 'emails' && (
                  <EmailViewer emails={emails} />
                )}
                {activeApp === 'notes' && (
                  <DocumentViewer documents={notes} />
                )}
                {activeApp === 'browser' && (
                  <TimelineViewer events={history} />
                )}
                {activeApp === 'files' && (
                  <FileExplorer files={files} />
                )}

                {/* Empty states for non-recovered partition sectors */}
                {(activeApp === 'calls' ||
                  activeApp === 'contacts' ||
                  activeApp === 'voicemails' ||
                  activeApp === 'calendar') && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/60 rounded bg-card/10 my-4 min-h-[200px]">
                    <div className="flex size-10 items-center justify-center rounded bg-muted/40 text-muted-foreground mb-3">
                      <AlertTriangle className="size-5" />
                    </div>
                    <span className="font-mono text-[0.625rem] text-destructive uppercase tracking-widest">
                      LỖI KHÔI PHỤC TOÀN VẸN
                    </span>
                    <p className="mt-2 text-pretty text-[0.7rem] text-muted-foreground max-w-[220px]">
                      Không tìm thấy thông tin khả dụng. Phân vùng dữ liệu này đã bị ghi đè hoặc hỏng vật lý khi tịch thu tang vật.
                    </p>
                  </div>
                )}
              </div>

              {/* LAYOUT LAYER 4: Recovery Status Panel */}
              {activeAppConfig && activeAppConfig.progress > 0 && (
                <RecoveryStatusPanel
                  progress={activeAppConfig.progress}
                  statusText={`PHÂN VÙNG ${activeAppConfig.label.toUpperCase()}`}
                />
              )}

              {/* LAYOUT LAYER 5: Chain of Custody / Integrity Indicator */}
              {activeAppConfig && activeAppConfig.progress > 0 && (
                <IntegrityIndicator
                  recoveredBy="DET. NIGHTJAR"
                  timestamp={device.lastUpdated}
                  integrityStatus={activeAppConfig.progress === 100 ? 'secured' : 'analyzing'}
                  chainOfCustody="NHẬT KÝ ĐÃ XÁC MINH"
                />
              )}
            </div>
          )}

        </div>

      </div>
        </>
      )}

    </div>
  )
}
