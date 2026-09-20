import type { Evaluation } from "@/lib/types";

export interface SheetEvaluationRow {
  case_id?: string;
  culprit_name?: string;
  motive_title?: string;
  method_title?: string;
  critical_evidences?: string;
  correct_timeline?: string;
  strengths?: string;
  weaknesses?: string;
  missed_evidence?: string;
  radar_scores?: string;
}

/**
 * Parses raw text lines from Google Sheets into structured radar score objects.
 * Format expected per line: "Tên tiêu chí | Điểm số | Mô tả"
 */
export function parseRadarScores(
  raw?: string,
): { id: string; name: string; score: number; desc: string }[] {
  if (!raw || typeof raw !== "string") return [];
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line, idx) => {
    const parts = line.split("|").map((p) => p.trim());
    return {
      id: `r${idx + 1}`,
      name: parts[0] || `Tiêu chí ${idx + 1}`,
      score: Number(parts[1]) || 85,
      desc: parts[2] || "",
    };
  });
}

/**
 * Parses multi-line timeline string from Google Sheet into string array.
 */
export function parseTimelineLines(raw?: string): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Parses comma-separated evidence codes into string array.
 */
export function parseEvidenceList(raw?: string): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Transforms a raw row from the 'evaluations' Google Sheet tab into a complete Evaluation domain object.
 * Falls back to default fallbackEvaluation if sheet row is missing or empty.
 */
export function transformSheetEvaluation(
  sheetRow?: SheetEvaluationRow,
  fallbackEvaluation?: Evaluation,
): Evaluation | undefined {
  if (!sheetRow || Object.keys(sheetRow).length === 0) {
    return fallbackEvaluation;
  }

  const criticalEvidences = parseEvidenceList(sheetRow.critical_evidences);
  const correctTimeline = parseTimelineLines(sheetRow.correct_timeline);
  const radarScores = parseRadarScores(sheetRow.radar_scores);

  return {
    caseId: sheetRow.case_id || fallbackEvaluation?.caseId || "case-000",
    suspectName:
      sheetRow.culprit_name || fallbackEvaluation?.suspectName || "Trần Thị Hà",
    motiveTitle:
      sheetRow.motive_title ||
      fallbackEvaluation?.motiveTitle ||
      "Cơn ghen cuồng loạn",
    methodTitle:
      sheetRow.method_title ||
      fallbackEvaluation?.methodTitle ||
      "Đâm đứt động mạch cảnh",
    radarScores:
      radarScores.length > 0
        ? radarScores
        : fallbackEvaluation?.radarScores || [],
    strengths: sheetRow.strengths || fallbackEvaluation?.strengths || "",
    weaknesses: sheetRow.weaknesses || fallbackEvaluation?.weaknesses || "",
    missedEvidence:
      sheetRow.missed_evidence ||
      fallbackEvaluation?.missedEvidence ||
      "Không có.",
    correctTimeline:
      correctTimeline.length > 0
        ? correctTimeline
        : fallbackEvaluation?.correctTimeline || [],
    evidenceUsage: {
      used:
        criticalEvidences.length > 0
          ? criticalEvidences
          : fallbackEvaluation?.evidenceUsage.used || [],
      ignored: fallbackEvaluation?.evidenceUsage.ignored || [],
      critical:
        criticalEvidences.length > 0
          ? criticalEvidences
          : fallbackEvaluation?.evidenceUsage.critical || [],
    },
  };
}
