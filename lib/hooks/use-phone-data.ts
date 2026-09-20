'use client'

import { useState, useEffect } from 'react'

export interface PhoneDataState<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePhoneData<T = any>(tab: string): PhoneDataState<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState<number>(0)

  const refetch = () => setReloadToken((prev) => prev + 1)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    fetch(`/api/phone?tab=${encodeURIComponent(tab)}&_t=${Date.now()}`, {
      cache: 'no-store',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        return res.json()
      })
      .then((result) => {
        if (!isMounted) return
        if (result.success && Array.isArray(result.data)) {
          setData(result.data)
          setError(null)
        } else {
          setError(result.error || 'Failed to fetch data')
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Network error')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [tab, reloadToken])

  return { data, loading, error, refetch }
}
