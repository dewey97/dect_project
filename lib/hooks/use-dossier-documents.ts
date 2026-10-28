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
export const CASE_000_DOSSIER_MAP: Record<string, string> = {};

export function useDossierDocuments(caseId: string): DossierDataState {
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
    const cleanTag = tagCode.trim().toUpperCase().replace(/-/g, '')
    return documents.find(d => d.tag_code.toUpperCase().replace(/-/g, '') === cleanTag)
  }

  const findMatchingDocument = (query: { code?: string; title?: string; id?: string }): DbDossierDocument | undefined => {
    if (!documents.length) return undefined

    // 1. Tìm qua CASE_000_DOSSIER_MAP theo code (ví dụ '08-LK' -> 'A19')
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

    // 3. Tìm động theo tiêu đề và tên nhân vật trong danh mục hồ sơ
    if (query.title) {
      const titleLower = query.title.toLowerCase();
      const isLan2 = titleLower.includes('lần 2');
      const isLoiKhai = titleLower.includes('lời khai') || titleLower.includes('hỏi cung');
      const isLyLich = titleLower.includes('lý lịch') || titleLower.includes('nhân thân');

      // Tìm tài liệu có subject_name xuất hiện trong tiêu đề
      const matched = documents.find((d) => {
        if (isLoiKhai && d.mode !== 'loi_khai') return false;
        if (isLyLich && d.mode !== 'ly_lich') return false;

        const subjName = (d.subject_name || '').toLowerCase().trim();
        if (!subjName) return false;

        // Trích xuất tên gọi (từ cuối cùng) và so khớp
        const lastName = subjName.split(/\s+/).pop() || subjName;
        const nameMatches =
          titleLower.includes(subjName) ||
          (lastName.length >= 2 && titleLower.includes(lastName));

        if (!nameMatches) return false;

        if (isLan2) {
          const docTitle = ((d.content as any)?.title || '').toLowerCase();
          const docNotes = ((d.content as any)?.ghi_chu || '').toLowerCase();
          return (
            docTitle.includes('lần 2') ||
            docTitle.includes('bổ sung') ||
            docNotes.includes('lần 2') ||
            docNotes.includes('bổ sung')
          );
        }

        return true;
      });

      if (matched) return matched;
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
