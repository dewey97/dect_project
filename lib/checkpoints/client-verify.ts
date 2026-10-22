/**
 * Client-side helper để gửi bài giải tới `/api/checkpoints/verify`.
 *
 * Chấm điểm tập trung trên server-side, giấu hoàn toàn answer_config.
 * Khi mất kết nối mạng hoặc lỗi server, trả về `offline: true` để modal
 * có thể xử lý fallback nếu cần.
 */

export interface VerifyCheckpointPayload {
  caseId: string;
  checkpointId: string;
  answer?: string;
  selectedCodes?: string[];
  motiveCodes?: string[];
  alibiCodes?: string[];
  contradictionCodes?: string[];
  inputs?: Record<string, string>;
  suspect?: string;
  motive?: string;
}

export interface VerifyCheckpointResult {
  success: boolean;
  correct: boolean;
  feedback?: string;
  unlocksEvidenceId?: string;
  unlocksDossier?: string;
  stageResults?: {
    motive?: boolean;
    alibi?: boolean;
    contradiction?: boolean;
  };
  error?: string;
  offline?: boolean;
}

export async function verifyCheckpointOnServer(
  payload: VerifyCheckpointPayload,
): Promise<VerifyCheckpointResult> {
  try {
    const res = await fetch("/api/checkpoints/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      return {
        success: false,
        correct: false,
        error: errJson?.error || `HTTP ${res.status}`,
        feedback: errJson?.error,
        offline: res.status >= 500,
      };
    }

    const json = await res.json();
    return {
      success: true,
      correct: Boolean(json.correct),
      feedback: json.feedback,
      unlocksEvidenceId: json.unlocksEvidenceId,
      unlocksDossier: json.unlocksDossier,
      stageResults: json.stageResults,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      correct: false,
      error: msg,
      offline: true,
    };
  }
}
