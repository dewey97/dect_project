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
  notes,
  history,
  files
}: PhoneSimulatorProps) {
  return (
    <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center overflow-hidden p-0">
      <IPhoneFrame
        device={device}
        threads={threads}
        photos={photos}
        notes={notes}
        history={history}
        files={files}
      />
    </div>
  )
}
