import type { LucideIcon } from 'lucide-react'
import { FolderSearch, HelpCircle, ShieldCheck } from 'lucide-react'

/**
 * Single source of truth for the persistent bottom navigation.
 * Keep this to 3 items for ultra-clean minimal navigation.
 */
export interface NavItem {
  href: string
  label: string
  code: string
  icon: LucideIcon
}
export const NAV_ITEMS: NavItem[] = [
  { href: '/evidence', label: 'Tài liệu & Vật chứng', code: 'DOCS', icon: FolderSearch },
  { href: '/board', label: 'Dẫn dắt & Gợi ý', code: 'HINT', icon: HelpCircle },
  { href: '/checkpoints', label: 'Mục tiêu & Kết luận', code: 'GOAL', icon: ShieldCheck },
]

