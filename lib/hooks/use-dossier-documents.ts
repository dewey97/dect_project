'use client'

import { useState, useEffect } from 'react'
import type { DbDossierDocument } from '@/lib/actions/dossier-actions'
import { getDossierDocuments } from '@/lib/actions/dossier-actions'

interface DossierDataState {
  documents: DbDossierDocument[]
  loading: boolean
  error: string | null
  findByTagCode: (tagCode: string) => DbDossierDocument | undefined
  findMatchingDocument: (query: { code?: string; title?: string; id?: string }) => DbDossierDocument | undefined
}

// Bộ nhớ đệm Client in-memory tránh gọi lặp lại Supabase
const dossierCache: Record<string, { data: DbDossierDocument[]; timestamp: number }> = {}
const dossierDocInFlight: Record<string, Promise<{ success: boolean; data?: DbDossierDocument[]; error?: string }> | undefined> = {}
const CACHE_TTL = 60_000 // 1 phút

async function fetchDossierDocsShared(caseId: string) {
  const existing = dossierDocInFlight[caseId];
  if (existing) {
    return existing;
  }
  const promise = (async () => {
    try {
      const res = await getDossierDocuments(caseId);
      if (res.success && res.data) {
        dossierCache[caseId] = { data: res.data, timestamp: Date.now() };
      }
      return res;
    } finally {
      delete dossierDocInFlight[caseId];
    }
  })();
  dossierDocInFlight[caseId] = promise;
  return promise;
}

/**
 * Bản đồ ánh xạ mã tài liệu vụ án (PDF code / Evidence code) sang mã Tag của Dossier Studio
 */
export const CASE_000_DOSSIER_MAP: Record<string, string> = {
  // Lời khai
  '06-LK': 'A-13', // Lời khai nhân chứng: Nguyễn Thị Lụa
  '07-LK': 'A-16', // Lời khai Nguyễn Ngọc Mai Lần 1
  '08-LK': 'A-19', // Lời khai Lê Quang Vũ Lần 1
  '09-LK': 'A-21', // Lời khai Trần Thị Hà Lần 1
  'A-02': 'B-01',  // Lời khai lần 2: Lê Quang Vũ
  'A-03': 'B-02',  // Biên bản làm việc chủ Quán Bia 88 (Nguyễn Văn Hùng)
  'B-02': 'E-02',  // Lời khai Nguyễn Thanh Tùng Lần 1
  'B-04': 'E-04',  // Lời khai Đạt Gà Chợ Cảng
  'C-01': 'B-05',  // Lời khai lần 2: Trần Thị Hà
  // Lý lịch
  '04-NN': 'A-03', // Nhân thân nạn nhân Nguyễn Văn Khang
  '05a-LL': 'A-15', // Lý lịch Nguyễn Ngọc Mai
  '05b-LL': 'A-17', // Lý lịch Lê Quang Vũ
  '05c-LL': 'A-20', // Lý lịch Trần Thị Hà
  'B-03': 'E-01',  // Lý lịch Nguyễn Thanh Tùng
  'B-05': 'E-03'   // Lý lịch Đạt Gà Chợ Cảng
}

export function useDossierDocuments(caseId: string = 'case_000'): DossierDataState {
  const normalizedCaseId = caseId.replace(/-/g, '_')
  const cached = dossierCache[normalizedCaseId]
  const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL

  const [documents, setDocuments] = useState<DbDossierDocument[]>(cached ? cached.data : [])
  const [loading, setLoading] = useState<boolean>(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const currentCached = dossierCache[normalizedCaseId]
    if (currentCached && Date.now() - currentCached.timestamp < CACHE_TTL) {
      setDocuments(currentCached.data)
      setLoading(false)
      return
    }

    setLoading(true)
    fetchDossierDocsShared(normalizedCaseId)
      .then((res) => {
        if (!isMounted) return
        if (res.success && res.data) {
          setDocuments(res.data)
        } else {
          setError(res.error || 'Failed to load dossiers')
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [normalizedCaseId])

  const findByTagCode = (tagCode: string): DbDossierDocument | undefined => {
    const cleanTag = tagCode.trim().toUpperCase()
    return documents.find(d => d.tag_code.toUpperCase() === cleanTag)
  }

  const findMatchingDocument = (query: { code?: string; title?: string; id?: string }): DbDossierDocument | undefined => {
    if (!documents.length) return undefined

    // 1. Tìm qua CASE_000_DOSSIER_MAP theo code (ví dụ '08-LK' -> 'A-19')
    if (query.code) {
      const cleanCode = query.code.trim().toUpperCase()
      const mappedTag = CASE_000_DOSSIER_MAP[cleanCode] || CASE_000_DOSSIER_MAP[query.code.trim()]
      if (mappedTag) {
        const found = findByTagCode(mappedTag)
        if (found) return found
      }
      // Tìm trực tiếp theo tagCode
      const direct = findByTagCode(cleanCode)
      if (direct) return direct
    }

    // 2. Tìm theo id (ví dụ 'dossier-UUID' hoặc 'pdf-08' -> match '08')
    if (query.id) {
      if (query.id.startsWith('dossier-')) {
        const docId = query.id.replace('dossier-', '')
        const foundById = documents.find(d => d.id === docId)
        if (foundById) return foundById
      }
      const idMatch = query.id.match(/\d+[a-z]?/i)
      if (idMatch) {
        const key = `${idMatch[0].toUpperCase()}-LK`
        const keyLL = `${idMatch[0].toUpperCase()}-LL`
        const mapped = CASE_000_DOSSIER_MAP[key] || CASE_000_DOSSIER_MAP[keyLL]
        if (mapped) {
          const found = findByTagCode(mapped)
          if (found) return found
        }
      }
    }

    // 3. Tìm theo tên nhân vật trong tiêu đề
    if (query.title) {
      const titleLower = query.title.toLowerCase()
      // Nếu là Lời khai
      if (titleLower.includes('lời khai') || titleLower.includes('hỏi cung')) {
        const isLan2 = titleLower.includes('lần 2')
        if (titleLower.includes('vũ')) {
          return findByTagCode(isLan2 ? 'B-01' : 'A-19')
        }
        if (titleLower.includes('mai')) {
          return findByTagCode('A-16')
        }
        if (titleLower.includes('hà')) {
          return findByTagCode(isLan2 ? 'B-05' : 'A-21')
        }
        if (titleLower.includes('tùng')) {
          return findByTagCode(isLan2 ? 'B-04' : 'E-02')
        }
        if (titleLower.includes('lụa')) {
          return findByTagCode('A-13')
        }
        if (titleLower.includes('tiến')) {
          return findByTagCode('A-14')
        }
        if (titleLower.includes('đạt')) {
          return findByTagCode('E-04')
        }
        if (titleLower.includes('quán bia') || titleLower.includes('hùng')) {
          return findByTagCode('B-02')
        }
      }

      // Nếu là Lý lịch
      if (titleLower.includes('lý lịch') || titleLower.includes('nhân thân')) {
        if (titleLower.includes('vũ')) return findByTagCode('A-17')
        if (titleLower.includes('mai')) return findByTagCode('A-15')
        if (titleLower.includes('hà')) return findByTagCode('A-20')
        if (titleLower.includes('tùng')) return findByTagCode('E-01')
        if (titleLower.includes('đạt')) return findByTagCode('E-03')
        if (titleLower.includes('khang')) return findByTagCode('A-03')
      }
    }

    return undefined
  }

  return {
    documents,
    loading,
    error,
    findByTagCode,
    findMatchingDocument
  }
}
