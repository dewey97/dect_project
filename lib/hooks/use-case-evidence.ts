"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { DbCaseEvidence } from "@/lib/types/database";
import type {
  PDFDocument,
  PhysicalEvidence,
} from "@/components/investigation/evidence/evidence-types";
import { getCaseEvidence } from "@/lib/actions/evidence-actions";
import { normalizeCaseId } from "@/lib/cases/case-id";

export interface CaseEvidenceState {
  pdfs: PDFDocument[];
  evidence: PhysicalEvidence[];
  rawEvidence: any[];
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
    code: item.code,
    kind: (item.kind === "image"
      ? "photo"
      : item.kind) as PhysicalEvidence["kind"],
    title: item.title,
    preview: item.description || "",
    timestamp: (meta.timestamp as string) || "",
    thumbnail: item.thumb_url || item.file_url || undefined,
    phase: item.phase,
    order: item.slot_index,
  };
}

const evidenceCache: Record<
  string,
  { data: DbCaseEvidence[]; timestamp: number }
> = {};
const evidenceInFlight: Record<
  string,
  Promise<{ success: boolean; data?: DbCaseEvidence[]; error?: string }>
> = {};
const CACHE_TTL_MS = 30_000;

async function fetchCaseEvidenceShared(slug: string) {
  if (evidenceInFlight[slug]) {
    return evidenceInFlight[slug];
  }

  const promise = (async () => {
    try {
      const res = await getCaseEvidence(slug);
      if (res.success && res.data && res.data.length > 0) {
        const enriched = res.data.map((item) => {
          const primaryUrl = item.thumb_url || item.file_url || "";
          const meta = (item.metadata as Record<string, unknown>) || {};
          return {
            ...meta,
            ...item,
            label: item.title,
            url: primaryUrl,
            drive_url: primaryUrl,
            image_url: primaryUrl,
            direct_cdn_url: primaryUrl,
            photo_code: item.code,
            photo_id: item.code,
          };
        });
        evidenceCache[slug] = {
          data: enriched,
          timestamp: Date.now(),
        };
        return { success: true, data: enriched };
      }
      return { success: res.success, data: [], error: res.error };
    } finally {
      delete evidenceInFlight[slug];
    }
  })();

  evidenceInFlight[slug] = promise;
  return promise;
}

export function useCaseEvidence(
  caseId: string = "case_000",
): CaseEvidenceState {
  const effectiveSlug = normalizeCaseId(caseId);
  const cached = evidenceCache[effectiveSlug];
  const isFresh = Boolean(cached && Date.now() - cached.timestamp < CACHE_TTL_MS);

  const [rawEvidence, setRawEvidence] = useState<DbCaseEvidence[]>(
    cached ? cached.data : [],
  );
  const [loading, setLoading] = useState<boolean>(!isFresh && !cached);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const refetch = useCallback(() => {
    delete evidenceCache[effectiveSlug];
    delete evidenceInFlight[effectiveSlug];
    setRefreshToken((prev) => prev + 1);
  }, [effectiveSlug]);

  useEffect(() => {
    let isMounted = true;
    const currentCached = evidenceCache[effectiveSlug];
    const isCurrentFresh = Boolean(
      currentCached && Date.now() - currentCached.timestamp < CACHE_TTL_MS,
    );

    if (refreshToken === 0 && isCurrentFresh && currentCached) {
      setRawEvidence(currentCached.data);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetchCaseEvidenceShared(effectiveSlug)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data && res.data.length > 0) {
          setRawEvidence(res.data);
          setError(null);
        } else {
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
  }, [effectiveSlug, refreshToken]);

  const { pdfs, evidence } = useMemo(() => {
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
  }, [rawEvidence]);

  return {
    pdfs,
    evidence,
    rawEvidence,
    loading,
    error,
    refetch,
  };
}
