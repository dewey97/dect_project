"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { DbCaseDossier } from "@/lib/types/database";
import { getCaseDossiers } from "@/lib/actions/dossier-config-actions";
import { normalizeCaseId } from "@/lib/cases/case-id";

export interface DossierOfResult {
  key: string;
  title: string;
  slotIndex: number;
}

interface UseCaseDossiersResult {
  dossiers: DbCaseDossier[];
  loading: boolean;
  error: string | null;
  getPhaseForCode: (code: string) => number;
  getDossierForCode: (code: string) => DbCaseDossier | undefined;
  dossierOf: (code: string) => DossierOfResult | null;
  refetch: () => Promise<void>;
}

function getDossierSlot(d: DbCaseDossier, fallbackIdx: number): number {
  if (typeof (d as any).slot_index === "number") return (d as any).slot_index;
  const key = (d.dossier_key || "").toLowerCase().trim();
  if (
    key === "ban_dau" ||
    key.includes("khởi đầu") ||
    key.includes("ban dau")
  ) {
    return 0;
  }
  if (key === "bo_a" || key === "phase_1") return 1;
  if (key === "bo_b" || key === "phase_2") return 2;
  if (key === "bo_c" || key === "phase_3") return 3;
  if (key === "ket_luan" || key === "phase_4") return 4;
  return fallbackIdx;
}

const dossierCache: Record<
  string,
  { data: DbCaseDossier[]; timestamp: number }
> = {};
const dossierInFlight: Record<string, Promise<DbCaseDossier[]> | undefined> = {};
const CACHE_TTL = 60_000;

async function fetchDossiersShared(caseId: string): Promise<DbCaseDossier[]> {
  const existing = dossierInFlight[caseId];
  if (existing) {
    return existing;
  }
  const promise = (async () => {
    try {
      const data = await getCaseDossiers(caseId);
      dossierCache[caseId] = { data, timestamp: Date.now() };
      return data;
    } finally {
      delete dossierInFlight[caseId];
    }
  })();
  dossierInFlight[caseId] = promise;
  return promise;
}

/**
 * Hook nạp danh mục các Bộ hồ sơ vụ án từ bảng `case_dossiers` (Supabase).
 * Dùng để ánh xạ mã tài liệu sang Phase/Bộ hồ sơ theo cấu hình đồ thị (C1),
 * thay thế hoàn toàn cho heuristic suy đoán theo chữ cái đầu của mã.
 */
export function useCaseDossiers(
  caseId: string = "case_000",
): UseCaseDossiersResult {
  const normalizedCaseId = normalizeCaseId(caseId);
  const cached = dossierCache[normalizedCaseId];
  const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL;

  const [dossiers, setDossiers] = useState<DbCaseDossier[]>(
    cached ? cached.data : [],
  );
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<string | null>(null);

  const fetchDossiers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDossiersShared(normalizedCaseId);
      setDossiers(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [normalizedCaseId]);

  useEffect(() => {
    const currentCached = dossierCache[normalizedCaseId];
    if (currentCached && Date.now() - currentCached.timestamp < CACHE_TTL) {
      setDossiers(currentCached.data);
      setLoading(false);
      return;
    }
    fetchDossiers();
  }, [normalizedCaseId, fetchDossiers]);

  // Sắp xếp dossiers theo slot_index
  const sortedDossiers = useMemo(() => {
    return [...dossiers].sort((a, b) => {
      const idxA = dossiers.indexOf(a);
      const idxB = dossiers.indexOf(b);
      return getDossierSlot(a, idxA) - getDossierSlot(b, idxB);
    });
  }, [dossiers]);

  // Tạo map tra cứu nhanh từ document_code -> DbCaseDossier & phase/slotIndex
  const { codeMap, dossierPhaseMap } = useMemo(() => {
    const codeMap = new Map<
      string,
      { dossier: DbCaseDossier; slotIndex: number }
    >();
    const dossierPhaseMap = new Map<string, number>();

    sortedDossiers.forEach((d, idx) => {
      const slotIndex = getDossierSlot(d, idx);
      const key = (d.dossier_key || "").toLowerCase().trim();
      dossierPhaseMap.set(key, slotIndex);

      const codes = d.document_codes || [];
      for (const code of codes) {
        if (typeof code === "string" && code.trim()) {
          codeMap.set(code.trim().toUpperCase(), { dossier: d, slotIndex });
        }
      }
    });

    return { codeMap, dossierPhaseMap };
  }, [sortedDossiers]);

  const dossierOf = useCallback(
    (code: string): DossierOfResult | null => {
      const clean = (code || "").trim().toUpperCase();
      const matched = codeMap.get(clean);
      if (!matched) return null;
      return {
        key: matched.dossier.dossier_key,
        title: matched.dossier.title,
        slotIndex: matched.slotIndex,
      };
    },
    [codeMap],
  );

  const getDossierForCode = useCallback(
    (code: string): DbCaseDossier | undefined => {
      const clean = (code || "").trim().toUpperCase();
      return codeMap.get(clean)?.dossier;
    },
    [codeMap],
  );

  const getPhaseForCode = useCallback(
    (code: string): number => {
      const clean = (code || "").trim().toUpperCase();
      const matched = codeMap.get(clean);
      if (matched) return matched.slotIndex;

      // Fallback an toàn cho mã chưa gán vào dossier_codes
      const firstChar = clean.charAt(0);
      if (firstChar === "A") return 1;
      if (firstChar === "B" || firstChar === "E") return 2;
      if (firstChar === "C" || firstChar === "D") return 3;
      return 0;
    },
    [codeMap],
  );

  return {
    dossiers: sortedDossiers,
    loading,
    error,
    getPhaseForCode,
    getDossierForCode,
    dossierOf,
    refetch: fetchDossiers,
  };
}
