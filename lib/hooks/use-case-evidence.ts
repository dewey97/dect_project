"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { DbCaseEvidence } from "@/lib/types/database";
import type {
  PDFDocument,
  PhysicalEvidence,
} from "@/components/investigation/evidence/evidence-types";
import { getCaseEvidence } from "@/lib/actions/evidence-actions";
import { normalizeCaseId } from "@/lib/cases/case-id";
import {
  CASE_000_PDFS,
  CASE_000_EVIDENCE,
} from "@/components/investigation/evidence/evidence-data";

export interface CaseEvidenceState {
  pdfs: PDFDocument[];
  evidence: PhysicalEvidence[];
  rawEvidence: DbCaseEvidence[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function mapDbToPdf(item: DbCaseEvidence): PDFDocument {
  const meta = item.metadata || {};
  return {
    id: (meta.id as string) || `pdf-${item.code}`,
    title: item.title,
    code: item.code,
    url: item.file_url || "",
    phase: item.phase,
    order: item.slot_index,
  };
}

function mapDbToPhysicalEvidence(item: DbCaseEvidence): PhysicalEvidence {
  const meta = item.metadata || {};
  return {
    id: (meta.id as string) || `ev-${item.code}`,
    caseId: item.case_slug,
    kind: (item.kind === "image"
      ? "photo"
      : item.kind) as PhysicalEvidence["kind"],
    title: item.title,
    preview: item.description || "",
    timestamp: (meta.timestamp as string) || "",
    evidenceId: (meta.evidenceId as string) || `EV-${item.code.toUpperCase()}`,
    recoveredBy: (meta.recoveredBy as string) || "ĐIỀU TRA VIÊN",
    integrityStatus:
      (meta.integrityStatus as PhysicalEvidence["integrityStatus"]) ||
      "secured",
    chainOfCustody: (meta.chainOfCustody as string) || "VERIFIED",
    thumbnail: item.thumb_url || item.file_url || undefined,
    phase: item.phase,
    order: item.slot_index,
  };
}

const evidenceCache: Record<
  string,
  { data: DbCaseEvidence[]; timestamp: number }
> = {};
const CACHE_TTL_MS = 30_000;

export function useCaseEvidence(
  caseId: string = "case_000",
): CaseEvidenceState {
  const effectiveSlug = normalizeCaseId(caseId);
  const cached = evidenceCache[effectiveSlug];
  const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

  const [rawEvidence, setRawEvidence] = useState<DbCaseEvidence[]>(
    cached ? cached.data : [],
  );
  const [loading, setLoading] = useState<boolean>(!isFresh);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const refetch = useCallback(() => {
    delete evidenceCache[effectiveSlug];
    setRefreshToken((prev) => prev + 1);
  }, [effectiveSlug]);

  useEffect(() => {
    let isMounted = true;

    if (refreshToken === 0 && isFresh) {
      setRawEvidence(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);

    getCaseEvidence(effectiveSlug)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data && res.data.length > 0) {
          evidenceCache[effectiveSlug] = {
            data: res.data,
            timestamp: Date.now(),
          };
          setRawEvidence(res.data);
          setError(null);
        } else {
          // Nếu Supabase chưa có dữ liệu hoặc migration 35 chưa chạy:
          // Fallback an toàn cho case_000 để gameplay và E2E không gãy
          setRawEvidence([]);
          if (!res.success && res.error) {
            setError(res.error);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveSlug, refreshToken, isFresh, cached]);

  const { pdfs, evidence } = useMemo(() => {
    // Nếu có dữ liệu từ Supabase, map từ rawEvidence
    if (rawEvidence.length > 0) {
      const dbPdfs: PDFDocument[] = [];
      const dbEvs: PhysicalEvidence[] = [];

      for (const item of rawEvidence) {
        if (item.kind === "pdf") {
          dbPdfs.push(mapDbToPdf(item));
        } else {
          dbEvs.push(mapDbToPhysicalEvidence(item));
        }
      }

      return { pdfs: dbPdfs, evidence: dbEvs };
    }

    // Fallback cho case_000 khi DB chưa seed / offline
    if (effectiveSlug === "case_000") {
      return { pdfs: CASE_000_PDFS, evidence: CASE_000_EVIDENCE };
    }

    return { pdfs: [], evidence: [] };
  }, [rawEvidence, effectiveSlug]);

  return {
    pdfs,
    evidence,
    rawEvidence,
    loading,
    error,
    refetch,
  };
}
