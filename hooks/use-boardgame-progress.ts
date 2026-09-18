'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCanonicalSuspectKey } from '@/lib/cases/case-000-suspects'

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
      const savedSuspects = localStorage.getItem('veritas_canvas_suspects')
      if (savedSuspects) {
        const parsed = JSON.parse(savedSuspects)
        const validList = parsed.filter((s: any) => s.id !== 'suspect-default-1')
        const sanitized = sanitizeSuspectsList(validList)
        setSuspects(sanitized)
      }

      const savedSolvedFollowups = localStorage.getItem('veritas_solved_followups')
      if (savedSolvedFollowups) {
        try {
          const parsed = JSON.parse(savedSolvedFollowups)
          setSolvedFollowupQuestions(parsed)
          if (parsed.includes('vu') && parsed.includes('tung')) {
            setIsReinvestigateUnlocked(true)
          }
        } catch {}
      }

      if (localStorage.getItem('veritas_reinvestigate_unlocked') === 'true') {
        setIsReinvestigateUnlocked(true)
      }
      if (localStorage.getItem('veritas_reinvestigate_opened') === 'true') {
        setHasOpenedReinvestigation(true)
      }

      const savedPhone = localStorage.getItem('veritas_phone_inputs')
      if (savedPhone) {
        try {
          const parsed = JSON.parse(savedPhone)
          if (parsed.phone1 || parsed.phone2 || parsed.phone3) {
            setPhoneLookupSuccess(true)
          }
        } catch {}
      }

      const savedInvestigated = localStorage.getItem('veritas_investigated_suspects')
      if (savedInvestigated) {
        try {
          const parsed = JSON.parse(savedInvestigated)
          setInvestigatedSuspects(parsed)
        } catch {}
      }

      if (localStorage.getItem('veritas_indictment_solved') === 'true') {
        setIsIndictmentSolved(true)
      }
      const savedCulprit = localStorage.getItem('veritas_indictment_culprit') as 'vu' | 'tung' | 'ha' | null
      if (savedCulprit) {
        setSolvedCulprit(savedCulprit)
      }
    } catch (e) {
      console.error('Failed to load boardgame progress from localStorage:', e)
    }
  }, [sanitizeSuspectsList])

  // Save suspects to state & localStorage
  const updateSuspects = useCallback((newSuspects: SuspectItem[] | ((prev: SuspectItem[]) => SuspectItem[])) => {
    setSuspects((prev) => {
      const nextList = typeof newSuspects === 'function' ? newSuspects(prev) : newSuspects
      const sanitized = sanitizeSuspectsList(nextList)
      try {
        localStorage.setItem('veritas_canvas_suspects', JSON.stringify(sanitized))
      } catch {}
      return sanitized
    })
  }, [sanitizeSuspectsList])

  const markReinvestigateUnlocked = useCallback(() => {
    setIsReinvestigateUnlocked(true)
    try {
      localStorage.setItem('veritas_reinvestigate_unlocked', 'true')
    } catch {}
  }, [])

  const markReinvestigateOpened = useCallback(() => {
    setHasOpenedReinvestigation(true)
    try {
      localStorage.setItem('veritas_reinvestigate_opened', 'true')
    } catch {}
  }, [])

  const markPhoneLookupSuccess = useCallback(() => {
    setPhoneLookupSuccess(true)
  }, [])

  const addInvestigatedSuspect = useCallback((culprit: 'vu' | 'tung' | 'ha') => {
    setInvestigatedSuspects((prev) => {
      if (prev.includes(culprit)) return prev
      const next = [...prev, culprit]
      try {
        localStorage.setItem('veritas_investigated_suspects', JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const addSolvedFollowupQuestion = useCallback((culprit: 'vu' | 'tung' | 'ha') => {
    setSolvedFollowupQuestions((prev) => {
      if (prev.includes(culprit)) return prev
      const next = [...prev, culprit]
      try {
        localStorage.setItem('veritas_solved_followups', JSON.stringify(next))
      } catch {}
      if (next.includes('vu') && next.includes('tung')) {
        markReinvestigateUnlocked()
      }
      return next
    })
  }, [markReinvestigateUnlocked])

  const completeIndictment = useCallback((culprit: 'vu' | 'tung' | 'ha') => {
    setIsIndictmentSolved(true)
    setSolvedCulprit(culprit)
    try {
      localStorage.setItem('veritas_indictment_solved', 'true')
      localStorage.setItem('veritas_indictment_culprit', culprit)
    } catch {}
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
