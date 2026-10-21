import type { CaseCharacterRole, DbCaseCharacter } from "@/lib/types/database";

/**
 * Registry nhân vật của vụ án đang chơi (nguồn: bảng `case_characters`).
 *
 * `CaseCharactersProvider` nạp dữ liệu một lần cho mỗi vụ án rồi ghi vào đây,
 * để các hàm thuần (so khớp tên nghi phạm, nhận diện SĐT, dựng pin) đọc được
 * mà không phải truyền danh sách qua mọi tầng component.
 */

let activeCaseId: string | null = null;
let activeCharacters: DbCaseCharacter[] = [];

export function setActiveCaseCharacters(
  caseId: string,
  characters: DbCaseCharacter[],
): void {
  activeCaseId = caseId;
  activeCharacters = [...characters].sort(
    (a, b) => a.slot_index - b.slot_index,
  );
}

export function getActiveCaseId(): string | null {
  return activeCaseId;
}

export function getActiveCaseCharacters(
  role?: CaseCharacterRole,
): DbCaseCharacter[] {
  return role
    ? activeCharacters.filter((c) => c.role === role)
    : activeCharacters;
}

export function getActiveVictim(): DbCaseCharacter | undefined {
  return activeCharacters.find((c) => c.role === "victim");
}

/** true khi id/tên trỏ tới nạn nhân của vụ án đang chơi. */
export function isVictimReference(value: string | null | undefined): boolean {
  const victim = getActiveVictim();
  const raw = (value || "").trim().toLowerCase();
  if (!victim || !raw) return false;
  const cleanId = raw.replace(/^(node-)?suspect-/, "").replace(/^avatar_/, "");
  if (cleanId === victim.key) return true;
  const plain = stripDiacritics(raw);
  const tokens = plain.split(/[^a-z0-9]+/).filter(Boolean);
  return (
    tokens.includes(victim.key) || plain.includes(stripDiacritics(victim.name))
  );
}

function stripDiacritics(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export interface KnownCasePhone {
  full: string;
  formatted: string;
  name: string;
}

function formatPhone(digits: string): string {
  return digits.length === 10
    ? `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}`
    : digits;
}

/** Danh bạ nhận diện manh mối SĐT, key là 3 số cuối. */
export function getKnownCasePhones(): Record<string, KnownCasePhone> {
  const directory: Record<string, KnownCasePhone> = {};
  for (const character of activeCharacters) {
    for (const phone of character.phones || []) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 3) continue;
      directory[digits.slice(-3)] = {
        full: digits,
        formatted: formatPhone(digits),
        name: character.name,
      };
    }
  }
  return directory;
}
