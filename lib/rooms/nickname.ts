/** Nickname và avatar tự sinh (spec 2.3). Logic thuần. */

export const NICKNAME_MAX_LENGTH = 20;

/** Gộp khoảng trắng, bỏ ký tự điều khiển, cắt 20 ký tự. Trả null nếu rỗng. */
export function cleanNickname(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const cleaned = Array.from(
    input
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  )
    .slice(0, NICKNAME_MAX_LENGTH)
    .join("")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

const AVATAR_COLORS = [
  "#8c2f1f",
  "#2f5d50",
  "#3b4a6b",
  "#7a5a1e",
  "#5c3b6b",
  "#2e5a7a",
  "#6b3b3b",
  "#4a5a2e",
];

/** Chữ cái đầu + màu ổn định theo nickname. */
export function nicknameAvatar(nickname: string): {
  initial: string;
  color: string;
} {
  const initial = (Array.from(nickname.trim())[0] || "?").toUpperCase();
  let hash = 0;
  for (const ch of nickname) {
    hash = (hash * 31 + (ch.codePointAt(0) || 0)) >>> 0;
  }
  return { initial, color: AVATAR_COLORS[hash % AVATAR_COLORS.length] };
}
