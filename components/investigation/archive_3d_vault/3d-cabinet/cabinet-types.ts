export interface CaseFile {
  id: string
  code: string
  title: string
  date: string
  summary: string
  details?: string
  classification?: string
  estimatedTime?: string
  difficulty?: string
  validCodes?: string[]
  caseUrl?: string
  folderBgColor?: string
  status?: 'ready' | 'locked'
}

export interface DrawerData {
  id: string
  label: string
  code: string
  position: [number, number, number]
  files: CaseFile[]
}
