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
  let effectiveCaseId = caseId;
  if (
    typeof window !== "undefined" &&
    (caseId === "case_000" || caseId === "case-000")
  ) {
    const params = new URLSearchParams(window.location.search);
    const paramCase = params.get("case_id") || params.get("caseId");
    if (paramCase) {
      effectiveCaseId = paramCase.replace(/-/g, "_");
    }
  }

  const cacheKey = `${tab}:${effectiveCaseId}`;
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
      requestPromise = (async () => {
        // 1. Dual-source: Try Supabase phone-data first
        try {
          const supabaseUrl = `/api/phone-data/${encodeURIComponent(tab)}?caseId=${encodeURIComponent(effectiveCaseId)}&_t=${Date.now()}`;
          const res = await fetch(supabaseUrl, { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            if (
              json.success &&
              Array.isArray(json.data) &&
              json.data.length > 0
            ) {
              return json;
            }
          }
        } catch {
          // fall through to Google Sheets fallback
        }

        // 2. Fallback to Google Sheets /api/phone
        const sheetsUrl = `/api/phone?tab=${encodeURIComponent(tab)}&caseId=${encodeURIComponent(effectiveCaseId)}&_t=${Date.now()}${isForcedRefetch ? "&refresh=true" : ""}`;
        const res = await fetch(sheetsUrl, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })().finally(() => {
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
