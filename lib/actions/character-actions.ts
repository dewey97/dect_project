"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/auth/admin";
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
  avatarUrl?: string | null;
  avatarAssetPath?: string | null;
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
  } catch (error: unknown) {
    console.error("Error loading characters:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
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
      avatar_url: draft.avatarUrl ?? null,
      avatar_asset_path: draft.avatarAssetPath ?? null,
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
  } catch (error: unknown) {
    const errObj = error as { code?: string; message?: string } | null;
    if (errObj?.code === "23505") {
      return {
        success: false,
        error: `Mã "${draft.key}" đã có trong vụ án này.`,
      };
    }
    console.error("Error saving character:", error);
    return {
      success: false,
      error:
        (error instanceof Error ? error.message : errObj?.message) ||
        "Không lưu được nhân vật.",
    };
  }
}

export async function uploadCharacterAvatar(
  caseSlugOrFormData: string | FormData,
  keyParam?: string,
  fileParam?: File | FormData,
): Promise<{
  success: boolean;
  data?: { url: string; path: string };
  error?: string;
}> {
  try {
    await requireAdminAuth();
    let caseSlug: string;
    let key: string;
    let file: File | null = null;

    if (caseSlugOrFormData instanceof FormData) {
      caseSlug =
        (caseSlugOrFormData.get("caseSlug") as string) ||
        (caseSlugOrFormData.get("caseId") as string) ||
        "case_000";
      key = (caseSlugOrFormData.get("key") as string) || "";
      file = caseSlugOrFormData.get("file") as File | null;
    } else {
      caseSlug = caseSlugOrFormData;
      key = keyParam || "";
      if (fileParam instanceof FormData) {
        file = fileParam.get("file") as File | null;
      } else {
        file = fileParam ?? null;
      }
    }

    const slug = normalizeCaseId(caseSlug);
    const cleanKey = key.trim().toLowerCase();

    if (!cleanKey || !KEY_PATTERN.test(cleanKey)) {
      return {
        success: false,
        error: "Mã nhân vật không hợp lệ.",
      };
    }

    if (!file || file.size === 0) {
      return { success: false, error: "File ảnh không hợp lệ hoặc rỗng." };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
    const filePath = slug.startsWith("e2e_")
      ? `e2e/${slug}_${cleanKey}.${cleanExt}`
      : `cases/${slug}/characters/${cleanKey}.${cleanExt}`;

    const supabase = await createClient();

    // Tìm nhân vật hiện tại để kiểm tra avatar_asset_path cũ
    const { data: existingChar } = await supabase
      .from("case_characters")
      .select("id, avatar_asset_path")
      .eq("case_slug", slug)
      .eq("key", cleanKey)
      .maybeSingle();

    if (
      existingChar?.avatar_asset_path &&
      existingChar.avatar_asset_path !== filePath
    ) {
      await supabase.storage
        .from("avatars")
        .remove([existingChar.avatar_asset_path]);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    if (existingChar) {
      const { error: updateError } = await supabase
        .from("case_characters")
        .update({
          avatar_url: publicUrl,
          avatar_asset_path: filePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingChar.id);

      if (updateError) throw updateError;
    }

    revalidatePath(STUDIO_PATH);
    return {
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
      },
    };
  } catch (error: unknown) {
    console.error("Error uploading character avatar:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function deleteCharacterAvatar(
  caseSlug: string,
  key: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(caseSlug);
    const cleanKey = key.trim().toLowerCase();

    const supabase = await createClient();
    const { data: character } = await supabase
      .from("case_characters")
      .select("id, avatar_asset_path")
      .eq("case_slug", slug)
      .eq("key", cleanKey)
      .maybeSingle();

    if (character?.avatar_asset_path) {
      await supabase.storage
        .from("avatars")
        .remove([character.avatar_asset_path]);
    }

    if (character) {
      const { error } = await supabase
        .from("case_characters")
        .update({
          avatar_url: null,
          avatar_asset_path: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", character.id);

      if (error) throw error;
    }

    revalidatePath(STUDIO_PATH);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting character avatar:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function deleteCharacter(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminAuth();
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("case_characters")
      .select("avatar_asset_path")
      .eq("id", id)
      .maybeSingle();
    if (existing?.avatar_asset_path) {
      await supabase.storage
        .from("avatars")
        .remove([existing.avatar_asset_path]);
    }

    const { error } = await supabase
      .from("case_characters")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath(STUDIO_PATH);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting character:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
