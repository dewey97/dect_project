"use client";

import { useState, useEffect, useCallback } from "react";
import type { DbCasePhoneApp } from "@/lib/types/database";
import { normalizeCaseId } from "@/lib/cases/case-id";

export interface PhoneAppsState {
  apps: DbCasePhoneApp[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const appsCache: Record<string, { data: DbCasePhoneApp[]; timestamp: number }> =
  {};
const CACHE_TTL_MS = 60_000; // 1 minute

export function usePhoneApps(caseId: string = "case_000"): PhoneAppsState {
  const effectiveSlug = normalizeCaseId(caseId);
  const cached = appsCache[effectiveSlug];
  const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

  const [apps, setApps] = useState<DbCasePhoneApp[]>(cached ? cached.data : []);
  const [loading, setLoading] = useState<boolean>(!isFresh);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const refetch = useCallback(() => {
    delete appsCache[effectiveSlug];
    setRefreshToken((prev) => prev + 1);
  }, [effectiveSlug]);

  useEffect(() => {
    let isMounted = true;

    if (refreshToken === 0 && isFresh) {
      setApps(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(
      `/api/phone-data/apps?caseId=${encodeURIComponent(effectiveSlug)}&_t=${Date.now()}`,
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((result) => {
        if (!isMounted) return;
        if (result.success && Array.isArray(result.data)) {
          appsCache[effectiveSlug] = {
            data: result.data,
            timestamp: Date.now(),
          };
          setApps(result.data);
          setError(null);
        } else {
          setError(result.error || "Không thể tải danh sách ứng dụng");
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveSlug, refreshToken, isFresh, cached]);

  return { apps, loading, error, refetch };
}
