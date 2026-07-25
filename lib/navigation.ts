import type { LucideIcon } from 'lucide-react'
import { FolderSearch, Fingerprint, Radio, Bot, ShieldUser, LayoutDashboard } from 'lucide-react'

/**
 * Single source of truth for the persistent bottom navigation.
 * Keep this to 4-5 items so every target stays thumb-reachable.
 */
export interface NavItem {
  href: string
  label: string
  /** Short system code shown under the icon for the OS feel. */
  code: string
  icon: LucideIcon
}
export const NAV_ITEMS: NavItem[] = [
  { href: '/checkpoints', label: 'Mục tiêu', code: 'CHKP', icon: FolderSearch },
  { href: '/board', label: 'Bảng chứng cứ', code: 'BORD', icon: LayoutDashboard },
  { href: '/evidence', label: 'Tang vật', code: 'EVID', icon: Fingerprint },
  { href: '/trace', label: 'Trace', code: 'TRCE', icon: Radio },
  { href: '/assistant', label: 'Trợ lý', code: 'ASST', icon: Bot },
]
