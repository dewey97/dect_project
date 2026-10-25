import type { Metadata } from 'next'
import { DossierStudioClient } from '@/components/admin/dossier-studio/dossier-studio-client'
import { getDossierDocuments } from '@/lib/actions/dossier-actions'
import { getCases } from '@/lib/actions/case-actions'
import { getCaseDossiers, getAllCaseDocumentsCatalog } from '@/lib/actions/dossier-config-actions'
import { normalizeCaseId } from '@/lib/cases/case-id'

export const metadata: Metadata = {
  title: 'Dossier Studio | Detective Case System',
  description: 'Biên tập & Dàn trang hồ sơ tư pháp, cấu hình bộ hồ sơ theo giai đoạn chuẩn in ấn A4/A5',
}

export const dynamic = 'force-dynamic'

export default async function DossierStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>
}) {
  const caseId = normalizeCaseId((await searchParams).case)
  const [lkRes, hsRes, casesRes, dossiersRes, catalogRes] = await Promise.all([
    getDossierDocuments(caseId, 'loi_khai'),
    getDossierDocuments(caseId, 'ly_lich'),
    getCases(),
    getCaseDossiers(caseId),
    getAllCaseDocumentsCatalog(caseId),
  ])

  return (
    <DossierStudioClient
      initialCaseId={caseId}
      initialCases={casesRes.data || []}
      initialLkDocuments={lkRes.data || []}
      initialHsDocuments={hsRes.data || []}
      initialDossiers={dossiersRes || []}
      initialAvailableDocuments={catalogRes || []}
    />
  )
}
