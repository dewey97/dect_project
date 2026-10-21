import type { Metadata } from 'next'
import { DossierStudioClient } from '@/components/admin/dossier-studio/dossier-studio-client'
import { getDossierDocuments } from '@/lib/actions/dossier-actions'
import { getCases } from '@/lib/actions/case-actions'
import { normalizeCaseId } from '@/lib/cases/case-id'

export const metadata: Metadata = {
  title: 'Dossier Studio | Detective Case System',
  description: 'Biên tập & Dàn trang hồ sơ tư pháp, biên bản lấy lời khai và trích lục lý lịch nghi phạm chuẩn in ấn A4/A5',
}

export const dynamic = 'force-dynamic'

export default async function DossierStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>
}) {
  const caseId = normalizeCaseId((await searchParams).case)
  const [lkRes, hsRes, casesRes] = await Promise.all([
    getDossierDocuments(caseId, 'loi_khai'),
    getDossierDocuments(caseId, 'ly_lich'),
    getCases()
  ])

  return (
    <DossierStudioClient
      initialCaseId={caseId}
      initialCases={casesRes.data || []}
      initialLkDocuments={lkRes.data || []}
      initialHsDocuments={hsRes.data || []}
    />
  )
}
