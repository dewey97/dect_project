"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "./auth-guard";
import { normalizeCaseId } from "@/lib/cases/case-id";
import type {
  CaseCharacterDevice,
  CaseCharacterRole,
  DbCaseCharacter,
} from "@/lib/types/database";

const STUDIO_PATH = "/studio/characters";
const KEY_PATTERN = /^[a-z0-9_]{1,40}$/;
const ROLES: CaseCharacterRole[] = ["victim", "suspect", "witness", "related"];

export interface CaseCharacterDraft {
  id?: string;
  caseId: string;
  key: string;
  name: string;
  aliases: string[];
  role: CaseCharacterRole;
  description: string;
  avatarCode: string;
  phones: string[];
  slotIndex: number;
  device: CaseCharacterDevice | null;
}

type CharacterResult =
  { success: true; data: DbCaseCharacter } | { success: false; error: string };

function cleanList(values: string[], transform = (v: string) => v): string[] {
  return Array.from(
    new Set(values.map((v) => transform(v.trim())).filter(Boolean)),
  );
}

export async function getCharactersByCase(
  caseId: string,
): Promise<{ success: boolean; data: DbCaseCharacter[]; error?: string }> {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_characters")
      .select("*")
      .eq("case_slug", normalizeCaseId(caseId))
      .order("slot_index", { ascending: true });
    if (error) throw error;
    return { success: true, data: (data || []) as DbCaseCharacter[] };
  } catch (error: any) {
    console.error("Error loading characters:", error);
    return { success: false, data: [], error: error.message };
  }
}

export async function saveCharacter(
  draft: CaseCharacterDraft,
): Promise<CharacterResult> {
  try {
    await requireAdminAuth();

    const key = draft.key.trim().toLowerCase();
    const name = draft.name.trim();
    if (!KEY_PATTERN.test(key)) {
      return {
        success: false,
        error: "Mã nhân vật chỉ gồm chữ thường không dấu, số và dấu gạch dưới.",
      };
    }
    if (!name)
      return { success: false, error: "Tên nhân vật không được để trống." };
    if (!ROLES.includes(draft.role)) {
      return { success: false, error: "Vai trò không hợp lệ." };
    }

    const payload = {
      case_slug: normalizeCaseId(draft.caseId),
      key,
      name,
      aliases: cleanList([name, key, ...draft.aliases], (v) => v.toLowerCase()),
      role: draft.role,
      description: draft.description.trim() || null,
      avatar_code: draft.avatarCode.trim() || `avatar_${key}`,
      phones: cleanList(draft.phones, (v) => v.replace(/\D/g, "")),
      slot_index: Number.isFinite(draft.slotIndex) ? draft.slotIndex : 0,
      device: draft.device,
      updated_at: new Date().toISOString(),
    };

    const supabase = await createClient();
    const query = draft.id
      ? supabase.from("case_characters").update(payload).eq("id", draft.id)
      : supabase.from("case_characters").insert(payload);
    const { data, error } = await query.select().single();

    if (error) throw error;
    revalidatePath(STUDIO_PATH);
    return { success: true, data: data as DbCaseCharacter };
  } catch (error: any) {
    if (error?.code === "23505") {
      return {
        success: false,
        error: `Mã "${draft.key}" đã có trong vụ án này.`,
      };
    }
    console.error("Error saving character:", error);
    return {
      success: false,
      error: error.message || "Không lưu được nhân vật.",
    };
  }
}

export async function deleteCharacter(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("case_characters")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath(STUDIO_PATH);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting character:", error);
    return { success: false, error: error.message };
  }
}
