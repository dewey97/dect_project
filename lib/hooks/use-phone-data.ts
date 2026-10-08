"use client";

import { useState, useEffect } from "react";

export interface PhoneDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// In-memory cache storage for instant tab switching without loading flicker
const memoryCache: Record<string, { data: any[]; timestamp: number }> = {};
// In-flight promise tracker to deduplicate simultaneous requests for the same tab
const inFlightPromises: Record<string, Promise<any>> = {};
const CACHE_TTL_MS = 30_000; // 30 seconds fresh cache

export function usePhoneData<T = any>(
  tab: string,
  caseId: string = "case_000",
): PhoneDataState<T> {
  const cacheKey = `${tab}:${caseId}`;
  const cached = memoryCache[cacheKey];
  const isCacheFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

  const [data, setData] = useState<T[]>(cached ? cached.data : []);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const refetch = () => {
    delete memoryCache[cacheKey];
    delete inFlightPromises[cacheKey];
    setReloadToken((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    // If cache is fresh and no explicit refetch requested, skip network call
    if (reloadToken === 0 && isCacheFresh) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    if (!cached) {
      setLoading(true);
    }

    // Deduplicate in-flight fetch promise for identical cacheKey
    let requestPromise = inFlightPromises[cacheKey];
    const isForcedRefetch = reloadToken > 0;

    if (!requestPromise || isForcedRefetch) {
      const url = `/api/phone?tab=${encodeURIComponent(tab)}&caseId=${encodeURIComponent(caseId)}&_t=${Date.now()}${isForcedRefetch ? "&refresh=true" : ""}`;

      requestPromise = fetch(url, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.json();
        })
        .finally(() => {
          delete inFlightPromises[cacheKey];
        });

      inFlightPromises[cacheKey] = requestPromise;
    }

    requestPromise
      .then((result) => {
        if (!isMounted) return;
        if (result.success && Array.isArray(result.data)) {
          memoryCache[cacheKey] = {
            data: result.data,
            timestamp: Date.now(),
          };
          setData(result.data);
          setError(null);
        } else {
          setError(result.error || "Failed to fetch data");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Network error");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tab, caseId, reloadToken, isCacheFresh, cacheKey]);

  return { data, loading, error, refetch };
}
