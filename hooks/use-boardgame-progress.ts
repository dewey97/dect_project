'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCanonicalSuspectKey } from '@/lib/cases/case-000-suspects'
import { getStorageItem, setStorageItem } from '@/lib/storage'

export interface SuspectItem {
  id: string
  name: string
  clueIds: string[]
  motiveClueIds?: string[]
  alibiClueIds?: string[]
}

export function useBoardGameProgress() {
  const [suspects, setSuspects] = useState<SuspectItem[]>([])
  const [isReinvestigateUnlocked, setIsReinvestigateUnlocked] = useState(false)
  const [hasOpenedReinvestigation, setHasOpenedReinvestigation] = useState(false)
  const [phoneLookupSuccess, setPhoneLookupSuccess] = useState(false)

  const [isIndictmentSolved, setIsIndictmentSolved] = useState(false)
  const [solvedCulprit, setSolvedCulprit] = useState<'vu' | 'tung' | 'ha' | null>(null)

  const [investigatedSuspects, setInvestigatedSuspects] = useState<('vu' | 'tung' | 'ha')[]>([])
  const [solvedFollowupQuestions, setSolvedFollowupQuestions] = useState<('vu' | 'tung' | 'ha')[]>([])

  // Helper to sanitize suspect list and ensure unique canonical IDs
  const sanitizeSuspectsList = useCallback((items: SuspectItem[]): SuspectItem[] => {
    const map = new Map<string, SuspectItem>()
    for (const s of items) {
      if (!s || !s.name) continue
      const { canonicalId, canonicalName } = getCanonicalSuspectKey(s)
      map.set(canonicalId, {
        ...s,
        id: canonicalId,
        name: canonicalName || s.name,
      })
    }
    return Array.from(map.values())
  }, [])

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const savedSuspects = getStorageItem('canvas_suspects')
      if (savedSuspects) {
        const parsed = JSON.parse(savedSuspects)
        const validList = parsed.filter((s: any) => s.id !== 'suspect-default-1')
        const sanitized = sanitizeSuspectsList(validList)
        setSuspects(sanitized)
      }

      const savedSolvedFollowups = getStorageItem('solved_followups')
      if (savedSolvedFollowups) {
        try {
          const parsed = JSON.parse(savedSolvedFollowups)
          setSolvedFollowupQuestions(parsed)
          if (parsed.includes('vu') && parsed.includes('tung')) {
            setIsReinvestigateUnlocked(true)
          }
        } catch {}
      }

      if (getStorageItem('reinvestigate_unlocked') === 'true') {
        setIsReinvestigateUnlocked(true)
      }
      if (getStorageItem('reinvestigate_opened') === 'true') {
        setHasOpenedReinvestigation(true)
      }

      const savedPhone = getStorageItem('phone_inputs')
      if (savedPhone) {
        try {
          const parsed = JSON.parse(savedPhone)
          if (parsed.phone1 || parsed.phone2 || parsed.phone3) {
            setPhoneLookupSuccess(true)
          }
        } catch {}
      }

      const savedInvestigated = getStorageItem('investigated_suspects')
      if (savedInvestigated) {
        try {
          const parsed = JSON.parse(savedInvestigated)
          setInvestigatedSuspects(parsed)
        } catch {}
      }

      if (getStorageItem('indictment_solved') === 'true') {
        setIsIndictmentSolved(true)
      }
      const savedCulprit = getStorageItem('indictment_culprit') as 'vu' | 'tung' | 'ha' | null
      if (savedCulprit) {
        setSolvedCulprit(savedCulprit)
      }
    } catch (e) {
      console.error('Failed to load boardgame progress from storage:', e)
    }
  }, [sanitizeSuspectsList])

  // Save suspects to state & localStorage
  const updateSuspects = useCallback((newSuspects: SuspectItem[] | ((prev: SuspectItem[]) => SuspectItem[])) => {
    setSuspects((prev) => {
      const nextList = typeof newSuspects === 'function' ? newSuspects(prev) : newSuspects
      const sanitized = sanitizeSuspectsList(nextList)
      setStorageItem('canvas_suspects', JSON.stringify(sanitized))
      return sanitized
    })
  }, [sanitizeSuspectsList])

  const markReinvestigateUnlocked = useCallback(() => {
    setIsReinvestigateUnlocked(true)
    setStorageItem('reinvestigate_unlocked', 'true')
  }, [])

  const markReinvestigateOpened = useCallback(() => {
    setHasOpenedReinvestigation(true)
    setStorageItem('reinvestigate_opened', 'true')
  }, [])

  const markPhoneLookupSuccess = useCallback(() => {
    setPhoneLookupSuccess(true)
  }, [])

  const addInvestigatedSuspect = useCallback((culprit: 'vu' | 'tung' | 'ha') => {
    setInvestigatedSuspects((prev) => {
      if (prev.includes(culprit)) return prev
      const next = [...prev, culprit]
      setStorageItem('investigated_suspects', JSON.stringify(next))
      return next
    })
  }, [])

  const addSolvedFollowupQuestion = useCallback((culprit: 'vu' | 'tung' | 'ha') => {
    setSolvedFollowupQuestions((prev) => {
      if (prev.includes(culprit)) return prev
      const next = [...prev, culprit]
      setStorageItem('solved_followups', JSON.stringify(next))
      if (next.includes('vu') && next.includes('tung')) {
        markReinvestigateUnlocked()
      }
      return next
    })
  }, [markReinvestigateUnlocked])

  const completeIndictment = useCallback((culprit: 'vu' | 'tung' | 'ha') => {
    setIsIndictmentSolved(true)
    setSolvedCulprit(culprit)
    setStorageItem('indictment_solved', 'true')
    setStorageItem('indictment_culprit', culprit)
  }, [])

  return {
    suspects,
    setSuspects: updateSuspects,
    isReinvestigateUnlocked,
    markReinvestigateUnlocked,
    hasOpenedReinvestigation,
    markReinvestigateOpened,
    phoneLookupSuccess,
    markPhoneLookupSuccess,
    isIndictmentSolved,
    solvedCulprit,
    completeIndictment,
    investigatedSuspects,
    addInvestigatedSuspect,
    solvedFollowupQuestions,
    addSolvedFollowupQuestion,
  }
}
