"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { DbCaseDossier } from "@/lib/types/database";
import { getCaseDossiers } from "@/lib/actions/dossier-config-actions";
import { normalizeCaseId } from "@/lib/cases/case-id";

interface UseCaseDossiersResult {
  dossiers: DbCaseDossier[];
  loading: boolean;
  error: string | null;
  getPhaseForCode: (code: string) => number;
  getDossierForCode: (code: string) => DbCaseDossier | undefined;
  refetch: () => Promise<void>;
}

const dossierCache: Record<
  string,
  { data: DbCaseDossier[]; timestamp: number }
> = {};
const CACHE_TTL = 60_000;

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
      const data = await getCaseDossiers(normalizedCaseId);
      dossierCache[normalizedCaseId] = { data, timestamp: Date.now() };
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
    if (isFresh) {
      setDossiers(cached.data);
      setLoading(false);
      return;
    }
    fetchDossiers();
  }, [normalizedCaseId, isFresh, fetchDossiers]);

  // Tạo map tra cứu nhanh từ document_code -> DbCaseDossier & phase
  const { codeMap, dossierPhaseMap } = useMemo(() => {
    const codeMap = new Map<string, DbCaseDossier>();
    const dossierPhaseMap = new Map<string, number>();

    // Chuẩn hóa phase theo dossier_key hoặc vị trí danh sách
    dossiers.forEach((d, idx) => {
      const key = (d.dossier_key || "").toLowerCase().trim();
      let phase = idx;
      if (
        key === "ban_dau" ||
        key.includes("khởi đầu") ||
        key.includes("ban dau")
      ) {
        phase = 0;
      } else if (key === "bo_a" || key === "phase_1") {
        phase = 1;
      } else if (key === "bo_b" || key === "phase_2") {
        phase = 2;
      } else if (key === "bo_c" || key === "phase_3") {
        phase = 3;
      } else if (key === "ket_luan" || key === "phase_4") {
        phase = 4;
      }
      dossierPhaseMap.set(key, phase);

      const codes = d.document_codes || [];
      for (const code of codes) {
        if (typeof code === "string" && code.trim()) {
          codeMap.set(code.trim().toUpperCase(), d);
        }
      }
    });

    return { codeMap, dossierPhaseMap };
  }, [dossiers]);

  const getDossierForCode = useCallback(
    (code: string): DbCaseDossier | undefined => {
      const clean = (code || "").trim().toUpperCase();
      return codeMap.get(clean);
    },
    [codeMap],
  );

  const getPhaseForCode = useCallback(
    (code: string): number => {
      const clean = (code || "").trim().toUpperCase();
      const matched = codeMap.get(clean);
      if (matched) {
        const key = (matched.dossier_key || "").toLowerCase().trim();
        const p = dossierPhaseMap.get(key);
        if (p !== undefined) return p;
      }

      // Fallback an toàn cho mã chưa gán vào dossier_codes
      const firstChar = clean.charAt(0);
      if (firstChar === "A") return 1;
      if (firstChar === "B" || firstChar === "E") return 2;
      if (firstChar === "C" || firstChar === "D") return 3;
      return 0;
    },
    [codeMap, dossierPhaseMap],
  );

  return {
    dossiers,
    loading,
    error,
    getPhaseForCode,
    getDossierForCode,
    refetch: fetchDossiers,
  };
}
