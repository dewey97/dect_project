import type { Evidence } from '@/lib/types'

export interface PDFDocument {
  id: string
  title: string
  code: string
  url: string
  phase: number
  order: number
}

export interface PhysicalEvidence extends Evidence {
  phase: number
  order: number
}

export type SelectedView =
  | { type: 'pdf'; data: PDFDocument }
  | { type: 'evidence'; data: PhysicalEvidence }

export type CombinedItem =
  | { type: 'pdf'; data: PDFDocument; phase: number; order: number }
  | { type: 'evidence'; data: PhysicalEvidence; phase: number; order: number }
