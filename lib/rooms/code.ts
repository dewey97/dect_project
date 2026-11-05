/**
 * Mã phòng 4 ký tự, Crockford Base32 (bỏ I, L, O, U để không nhầm khi đọc to).
 * Logic thuần, không import alias để chạy được bằng `node --test`.
 */

export const ROOM_CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const ROOM_CODE_LENGTH = 4;

/** Sinh mã ngẫu nhiên. `randomInt(n)` trả số nguyên trong [0, n). */
export function generateRoomCode(randomInt: (max: number) => number): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Chuẩn hóa mã người chơi gõ: bỏ khoảng trắng, gạch, viết hoa,
 * O→0, I/L→1 (quy ước Crockford). Trả null nếu không phải mã hợp lệ.
 */
export function normalizeRoomCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const cleaned = input
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
  if (cleaned.length !== ROOM_CODE_LENGTH) return null;
  for (const ch of cleaned) {
    if (!ROOM_CODE_ALPHABET.includes(ch)) return null;
  }
  return cleaned;
}
