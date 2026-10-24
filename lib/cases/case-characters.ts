import type { CaseCharacterRole, DbCaseCharacter } from "@/lib/types/database";
import { normalizeForMatch } from "@/lib/text";

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
  const plain = normalizeForMatch(raw);
  const tokens = plain.split(/[^a-z0-9]+/).filter(Boolean);
  return (
    tokens.includes(victim.key) ||
    plain.includes(normalizeForMatch(victim.name))
  );
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

/** So khớp liên hệ danh bạ điện thoại với nhân vật vụ án theo SĐT hoặc tên/bí danh. */
export function findCharacterByPhoneOrName(
  phone?: string | null,
  name?: string | null,
): DbCaseCharacter | undefined {
  const characters = activeCharacters;
  const cleanPhone = (phone || "").replace(/\D/g, "");
  if (cleanPhone) {
    const byPhone = characters.find((c) =>
      c.phones?.some((p) => {
        const pDigits = p.replace(/\D/g, "");
        return (
          pDigits === cleanPhone ||
          (cleanPhone.length >= 7 && pDigits.endsWith(cleanPhone)) ||
          (pDigits.length >= 7 && cleanPhone.endsWith(pDigits))
        );
      }),
    );
    if (byPhone) return byPhone;
  }

  if (name) {
    const raw = name.trim().toLowerCase();
    if (!raw) return undefined;
    const clean = normalizeForMatch(raw);
    const byName = characters.find((c) => {
      if (c.name.toLowerCase() === raw || normalizeForMatch(c.name) === clean)
        return true;
      if (c.key.toLowerCase() === raw) return true;
      return c.aliases?.some(
        (a) => a.toLowerCase() === raw || normalizeForMatch(a) === clean,
      );
    });
    if (byName) return byName;
  }

  return undefined;
}
