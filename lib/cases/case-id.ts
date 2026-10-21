/**
 * Mã định danh vụ án (case slug) dùng chung cho Studio, API và gameplay.
 *
 * Dạng chuẩn: `case_000` (chữ thường, gạch dưới) — khớp `cases.slug` trong Supabase.
 * URL cũ và một số bảng cũ còn dùng `case-000`; mọi đầu vào phải qua `normalizeCaseId`.
 */

export const DEFAULT_CASE_ID = "case_000";

const CASE_ID_PATTERN = /^[a-z0-9_]{1,64}$/;

export function normalizeCaseId(raw?: string | null): string {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  return CASE_ID_PATTERN.test(value) ? value : DEFAULT_CASE_ID;
}

/** true khi chuỗi chuẩn hóa được thành slug hợp lệ (không rơi về mặc định). */
export function isValidCaseId(raw?: string | null): boolean {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  return CASE_ID_PATTERN.test(value);
}

/** Các dạng mã có thể còn nằm trong dữ liệu cũ (`case_000`, `case-000`). */
export function caseIdVariants(raw?: string | null): string[] {
  const id = normalizeCaseId(raw);
  const dashed = id.replace(/_/g, "-");
  return dashed === id ? [id] : [id, dashed];
}

/**
 * Key localStorage theo vụ án.
 * case_000 giữ key không tiền tố để không mất tiến trình của người chơi cũ.
 */
export function caseStorageKey(
  caseId: string | null | undefined,
  key: string,
): string {
  const id = normalizeCaseId(caseId);
  return id === DEFAULT_CASE_ID ? key : `${id}::${key}`;
}
