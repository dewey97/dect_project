"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { setActiveCaseCharacters } from "@/lib/cases/case-characters";
import type { DbCaseCharacter } from "@/lib/types/database";

interface CaseCharactersValue {
  caseId: string;
  characters: DbCaseCharacter[];
}

const CaseCharactersContext = createContext<CaseCharactersValue | null>(null);

/** Cache theo vụ án để chuyển trang trong phiên không phải tải lại. */
const loadedCases = new Map<string, DbCaseCharacter[]>();

async function fetchCharacters(caseId: string): Promise<DbCaseCharacter[]> {
  const response = await fetch(
    `/api/characters?caseId=${encodeURIComponent(caseId)}`,
    { cache: "no-store" },
  );
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result?.error || `HTTP ${response.status}`);
  }
  return result.data as DbCaseCharacter[];
}

/**
 * Nạp danh sách nhân vật (bảng `case_characters`) của vụ án trên URL `?case_id=`
 * trước khi render bàn điều tra, vì các hàm so khớp tên nghi phạm / SĐT đọc
 * registry đồng bộ trong lúc render.
 */
export function CaseCharactersProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const caseId = normalizeCaseId(
    searchParams.get("case_id") || searchParams.get("caseId"),
  );
  const [value, setValue] = useState<CaseCharactersValue | null>(() => {
    const cached = loadedCases.get(caseId);
    if (!cached) return null;
    setActiveCaseCharacters(caseId, cached);
    return { caseId, characters: cached };
  });
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const cached = loadedCases.get(caseId);
    if (cached) {
      setActiveCaseCharacters(caseId, cached);
      setValue({ caseId, characters: cached });
      return;
    }

    let cancelled = false;
    setError(null);
    fetchCharacters(caseId)
      .then((characters) => {
        if (cancelled) return;
        loadedCases.set(caseId, characters);
        setActiveCaseCharacters(caseId, characters);
        setValue({ caseId, characters });
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Network error");
      });
    return () => {
      cancelled = true;
    };
  }, [caseId, attempt]);

  if (!value || value.caseId !== caseId) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-background px-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {error ? (
          <div className="space-y-3">
            <p>Không tải được hồ sơ nhân vật vụ án.</p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="min-h-11 rounded border border-border px-4 py-2 text-foreground hover:bg-muted"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <p aria-live="polite">Đang đồng bộ hồ sơ vụ án…</p>
        )}
      </div>
    );
  }

  return (
    <CaseCharactersContext.Provider value={value}>
      {children}
    </CaseCharactersContext.Provider>
  );
}

export function useCaseCharacters(): CaseCharactersValue {
  const value = useContext(CaseCharactersContext);
  if (!value) {
    throw new Error("useCaseCharacters phải nằm trong CaseCharactersProvider");
  }
  return value;
}
