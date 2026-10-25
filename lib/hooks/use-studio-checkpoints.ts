"use client";

import { useCallback, useEffect, useState } from "react";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import { normalizeCaseId } from "@/lib/cases/case-id";

export interface StudioCheckpointsState {
  rows: DbCaseCheckpoint[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_TTL_MS = 30_000;
const memoryCache: Record<
  string,
  { rows: DbCaseCheckpoint[]; timestamp: number }
> = {};
const inFlight: Record<string, Promise<DbCaseCheckpoint[]>> = {};

function caseIdFromUrl(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  if (normalizeCaseId(fallback) !== "case_000") return fallback;
  const params = new URLSearchParams(window.location.search);
  const param = params.get("case_id") || params.get("caseId");
  return param ? normalizeCaseId(param) : fallback;
}

async function fetchRows(caseId: string): Promise<DbCaseCheckpoint[]> {
  const url = `/api/checkpoints?caseId=${encodeURIComponent(caseId)}&_t=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result?.error || `HTTP ${response.status}`);
  }
  return Array.isArray(result.data) ? (result.data as DbCaseCheckpoint[]) : [];
}

/**
 * Đọc checkpoint của một vụ án từ Checkpoint Studio (Supabase).
 * Có memory cache 30s và dedupe request để tránh gọi lặp khi nhiều component
 * cùng mở một checkpoint.
 */
export function useStudioCheckpoints(
  caseId: string = "case_000",
): StudioCheckpointsState {
  const [effectiveCaseId, setEffectiveCaseId] = useState(() =>
    normalizeCaseId(caseId),
  );
  const [rows, setRows] = useState<DbCaseCheckpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    setEffectiveCaseId(caseIdFromUrl(normalizeCaseId(caseId)));
  }, [caseId]);

  const refetch = useCallback(() => {
    delete memoryCache[effectiveCaseId];
    delete inFlight[effectiveCaseId];
    setReloadToken((value) => value + 1);
  }, [effectiveCaseId]);

  useEffect(() => {
    let mounted = true;
    const cached = memoryCache[effectiveCaseId];
    if (
      reloadToken === 0 &&
      cached &&
      Date.now() - cached.timestamp < CACHE_TTL_MS
    ) {
      setRows(cached.rows);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const pending =
      reloadToken === 0
        ? (inFlight[effectiveCaseId] as
            | Promise<DbCaseCheckpoint[]>
            | undefined)
        : undefined;
    const request = pending ?? fetchRows(effectiveCaseId);

    if (reloadToken === 0) {
      const tracked = request.finally(() => {
        delete inFlight[effectiveCaseId];
      });
      tracked.catch(() => {
        // Consumer bên dưới xử lý lỗi; catch này tránh unhandled rejection.
      });
      inFlight[effectiveCaseId] = tracked;
    }

    request
      .then((data) => {
        if (!mounted) return;
        memoryCache[effectiveCaseId] = { rows: data, timestamp: Date.now() };
        setRows(data);
        setError(null);
      })
      .catch((fetchError: Error) => {
        if (!mounted) return;
        setError(fetchError.message || "Network error");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [effectiveCaseId, reloadToken]);

  return { rows, loading, error, refetch };
}
