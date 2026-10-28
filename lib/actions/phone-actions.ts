"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/auth/admin";
import { normalizeCaseId } from "@/lib/cases/case-id";
import { revalidatePath } from "next/cache";
import type {
  DbCasePhoneApp,
  DbPhoneContact,
  DbPhoneCall,
  DbPhoneMessage,
  DbPhonePhoto,
  DbPhoneNote,
  DbPhoneBankTx,
  DbPhoneBrowserHistory,
  CaseCharacterDevice,
} from "@/lib/types/database";

// ── 1. Phone Apps (App Launcher) ──

export async function getPhoneApps(caseId: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_phone_apps")
      .select("*")
      .eq("case_slug", slug)
      .order("is_dock", { ascending: true })
      .order("slot_index", { ascending: true });

    if (error) throw error;
    return { success: true, data: (data || []) as DbCasePhoneApp[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] };
  }
}

export async function upsertPhoneApp(
  app: Partial<DbCasePhoneApp> & {
    case_slug: string;
    app_type: string;
    display_name: string;
  },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(app.case_slug);
    const supabase = await createClient();

    const payload = {
      ...app,
      case_slug: slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("case_phone_apps")
      .upsert(payload, { onConflict: "case_slug,app_type" })
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true, data: data as DbCasePhoneApp };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function deletePhoneApp(id: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("case_phone_apps")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function reorderPhoneApps(
  caseId: string,
  items: { id: string; slot_index: number; is_dock: boolean }[],
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();

    for (const item of items) {
      const { error } = await supabase
        .from("case_phone_apps")
        .update({
          slot_index: item.slot_index,
          is_dock: item.is_dock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)
        .eq("case_slug", slug);

      if (error) throw error;
    }

    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 2. Phone Contacts (Danh bạ) ──

export async function getPhoneContacts(caseId: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("phone_contacts")
      .select("*")
      .eq("case_slug", slug)
      .order("slot_index", { ascending: true });

    if (error) throw error;
    return { success: true, data: (data || []) as DbPhoneContact[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] };
  }
}

export async function upsertPhoneContact(
  contact: Partial<DbPhoneContact> & { case_slug: string; name: string },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(contact.case_slug);
    const supabase = await createClient();

    const payload = {
      ...contact,
      case_slug: slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("phone_contacts")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true, data: data as DbPhoneContact };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function deletePhoneContact(id: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("phone_contacts")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 3. Phone Calls (Lịch sử cuộc gọi) ──

export async function getPhoneCalls(caseId: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("phone_calls")
      .select("*")
      .eq("case_slug", slug)
      .order("slot_index", { ascending: true });

    if (error) throw error;
    return { success: true, data: (data || []) as DbPhoneCall[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] };
  }
}

export async function upsertPhoneCall(
  call: Partial<DbPhoneCall> & { case_slug: string; contact_name: string },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(call.case_slug);
    const supabase = await createClient();

    const payload = {
      ...call,
      case_slug: slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("phone_calls")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true, data: data as DbPhoneCall };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function deletePhoneCall(id: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase.from("phone_calls").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 4. Phone Messages (Tin nhắn) ──

export async function getPhoneMessages(caseId: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("phone_messages")
      .select("*")
      .eq("case_slug", slug)
      .order("slot_index", { ascending: true });

    if (error) throw error;
    return { success: true, data: (data || []) as DbPhoneMessage[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] };
  }
}

export async function upsertPhoneMessage(
  msg: Partial<DbPhoneMessage> & {
    case_slug: string;
    thread_key: string;
    thread_name: string;
    sender: string;
    body: string;
  },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(msg.case_slug);
    const supabase = await createClient();

    const payload = {
      ...msg,
      case_slug: slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("phone_messages")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true, data: data as DbPhoneMessage };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function deletePhoneMessage(id: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("phone_messages")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export interface BatchMessageItemInput {
  id?: string;
  sender?: string;
  role?: string;
  body: string;
  timestamp?: string | null;
  code?: string | null;
  is_clue?: boolean;
  clue_title?: string | null;
  clue_analysis?: string | null;
  attachment_type?: string | null;
  attachment_url?: string | null;
  attachment_duration?: string | null;
}

export async function savePhoneMessagesBatch(
  caseSlug: string,
  threadKey: string,
  messages: BatchMessageItemInput[],
  threadMeta?: { thread_name?: string; thread_phone?: string | null },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(caseSlug);
    const key = threadKey.trim();
    if (!key) throw new Error("thread_key không được để trống.");

    const supabase = await createClient();
    const resolvedName = threadMeta?.thread_name?.trim() || key;
    const resolvedPhone = threadMeta?.thread_phone?.trim() || null;

    // 1. Lấy danh sách ID hiện có trong thread này
    const { data: existingRows, error: fetchErr } = await supabase
      .from("phone_messages")
      .select("id")
      .eq("case_slug", slug)
      .eq("thread_key", key);

    if (fetchErr) throw fetchErr;

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const incomingValidIds = new Set(
      messages
        .filter((m) => m.id && UUID_REGEX.test(m.id))
        .map((m) => m.id as string),
    );

    // 2. Xóa các tin nhắn không còn nằm trong batch
    const deletedIds = (existingRows || [])
      .map((r) => r.id)
      .filter((id) => !incomingValidIds.has(id));

    if (deletedIds.length > 0) {
      const { error: delErr } = await supabase
        .from("phone_messages")
        .delete()
        .in("id", deletedIds);
      if (delErr) throw delErr;
    }

    // 3. Nếu danh sách rỗng sau khi xóa
    if (messages.length === 0) {
      revalidatePath("/(admin)/studio/phone", "page");
      return { success: true, data: [] };
    }

    // 4. Chuẩn bị payload và đánh lại slot_index tuần tự trong thread (0, 1, 2...)
    const now = new Date().toISOString();
    const payload = messages.map((m, slotIndex) => {
      const roleStr = String(m.role || "")
        .toLowerCase()
        .trim();
      const isSent =
        roleStr === "sent" ||
        roleStr === "me" ||
        roleStr === "victim" ||
        m.sender === "Nạn nhân" ||
        m.sender === "Tôi";
      const role = isSent ? "sent" : "received";
      const sender = m.sender?.trim() || (isSent ? "Nạn nhân" : resolvedName);

      const item: Record<string, unknown> = {
        case_slug: slug,
        thread_key: key,
        thread_name: resolvedName,
        thread_phone: resolvedPhone,
        sender,
        role,
        body: m.body || "",
        timestamp: m.timestamp?.trim() || null,
        code: m.code?.trim() || null,
        is_clue: Boolean(m.is_clue),
        clue_title: m.clue_title?.trim() || null,
        clue_analysis: m.clue_analysis?.trim() || null,
        attachment_type: m.attachment_type || null,
        attachment_url: m.attachment_url?.trim() || null,
        attachment_duration: m.attachment_duration?.trim() || null,
        slot_index: slotIndex,
        updated_at: now,
      };

      if (m.id && UUID_REGEX.test(m.id)) {
        item.id = m.id;
      }

      return item;
    });

    const { error: upsertErr } = await supabase
      .from("phone_messages")
      .upsert(payload);

    if (upsertErr) throw upsertErr;

    // Lấy lại danh sách đầy đủ sau khi upsert
    const { data: refreshed, error: refErr } = await supabase
      .from("phone_messages")
      .select("*")
      .eq("case_slug", slug)
      .eq("thread_key", key)
      .order("slot_index", { ascending: true });

    if (refErr) throw refErr;

    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true, data: (refreshed || []) as DbPhoneMessage[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] };
  }
}

export async function deletePhoneThread(caseSlug: string, threadKey: string) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(caseSlug);
    const supabase = await createClient();

    const { error } = await supabase
      .from("phone_messages")
      .delete()
      .eq("case_slug", slug)
      .eq("thread_key", threadKey);

    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 5. Phone Photos (Thư viện ảnh) ──

export async function getPhonePhotos(caseId: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("phone_photos")
      .select("*")
      .eq("case_slug", slug)
      .order("slot_index", { ascending: true });

    if (error) throw error;
    return { success: true, data: (data || []) as DbPhonePhoto[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] };
  }
}

export async function upsertPhonePhoto(
  photo: Partial<DbPhonePhoto> & {
    case_slug: string;
    label: string;
    image_url: string;
  },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(photo.case_slug);
    const supabase = await createClient();

    const payload = {
      ...photo,
      case_slug: slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("phone_photos")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true, data: data as DbPhonePhoto };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function deletePhonePhoto(id: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase.from("phone_photos").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 6. Phone Notes (Ghi chú) ──

export async function getPhoneNotes(caseId: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("phone_notes")
      .select("*")
      .eq("case_slug", slug)
      .order("slot_index", { ascending: true });

    if (error) throw error;
    return { success: true, data: (data || []) as DbPhoneNote[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] };
  }
}

export async function upsertPhoneNote(
  note: Partial<DbPhoneNote> & { case_slug: string; title: string },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(note.case_slug);
    const supabase = await createClient();

    const payload = {
      ...note,
      case_slug: slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("phone_notes")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true, data: data as DbPhoneNote };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function deletePhoneNote(id: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase.from("phone_notes").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 7. Phone Bank Transactions (Ngân hàng) ──

export async function getPhoneBankTransactions(caseId: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("phone_bank_transactions")
      .select("*")
      .eq("case_slug", slug)
      .order("slot_index", { ascending: true });

    if (error) throw error;
    return { success: true, data: (data || []) as DbPhoneBankTx[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] };
  }
}

export async function upsertPhoneBankTransaction(
  tx: Partial<DbPhoneBankTx> & { case_slug: string; counterparty: string },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(tx.case_slug);
    const supabase = await createClient();

    const payload = {
      ...tx,
      case_slug: slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("phone_bank_transactions")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true, data: data as DbPhoneBankTx };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function deletePhoneBankTransaction(id: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("phone_bank_transactions")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 8. Phone Browser History (Safari) ──

export async function getPhoneBrowserHistory(caseId: string) {
  try {
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("phone_browser_history")
      .select("*")
      .eq("case_slug", slug)
      .order("slot_index", { ascending: true });

    if (error) throw error;
    return { success: true, data: (data || []) as DbPhoneBrowserHistory[] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg, data: [] };
  }
}

export async function upsertPhoneBrowserHistory(
  item: Partial<DbPhoneBrowserHistory> & { case_slug: string; title: string },
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(item.case_slug);
    const supabase = await createClient();

    const payload = {
      ...item,
      case_slug: slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("phone_browser_history")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true, data: data as DbPhoneBrowserHistory };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

export async function deletePhoneBrowserHistory(id: string) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("phone_browser_history")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 9. Device Profile (case_characters.device) ──

export async function updateDeviceProfile(
  caseId: string,
  deviceData: CaseCharacterDevice,
) {
  try {
    await requireAdminAuth();
    const slug = normalizeCaseId(caseId);
    const supabase = await createClient();

    // Tìm nhân vật có vai trò victim hoặc nhân vật đầu tiên có device
    const { data: victimChar } = await supabase
      .from("case_characters")
      .select("id, device")
      .eq("case_slug", slug)
      .eq("role", "victim")
      .maybeSingle();

    const targetId = victimChar?.id;
    if (!targetId) {
      return {
        success: false,
        error: "Không tìm thấy nhân vật nạn nhân trong vụ án này.",
      };
    }

    const mergedDevice = {
      ...((victimChar.device as Record<string, unknown>) || {}),
      ...deviceData,
    };

    const { error } = await supabase
      .from("case_characters")
      .update({
        device: mergedDevice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetId);

    if (error) throw error;
    revalidatePath("/(admin)/studio/phone", "page");
    return { success: true, data: mergedDevice };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 10. Duplicate Phone Data (Nhân bản per-case) ──

export async function duplicatePhoneData(
  sourceSlug: string,
  targetSlug: string,
) {
  try {
    await requireAdminAuth();
    const fromSlug = normalizeCaseId(sourceSlug);
    const toSlug = normalizeCaseId(targetSlug);
    const supabase = await createClient();

    // 1. case_phone_apps
    const { data: apps } = await supabase
      .from("case_phone_apps")
      .select("*")
      .eq("case_slug", fromSlug);
    if (apps && apps.length > 0) {
      const cloned = (apps as DbCasePhoneApp[]).map(
        ({ id: _id, created_at: _c, updated_at: _u, ...rest }) => ({
          ...rest,
          case_slug: toSlug,
        }),
      );
      await supabase.from("case_phone_apps").insert(cloned);
    }

    // 2. phone_contacts
    const { data: contacts } = await supabase
      .from("phone_contacts")
      .select("*")
      .eq("case_slug", fromSlug);
    if (contacts && contacts.length > 0) {
      const cloned = (contacts as DbPhoneContact[]).map(
        ({ id: _id, created_at: _c, updated_at: _u, ...rest }) => ({
          ...rest,
          case_slug: toSlug,
        }),
      );
      await supabase.from("phone_contacts").insert(cloned);
    }

    // 3. phone_calls
    const { data: calls } = await supabase
      .from("phone_calls")
      .select("*")
      .eq("case_slug", fromSlug);
    if (calls && calls.length > 0) {
      const cloned = (calls as DbPhoneCall[]).map(
        ({ id: _id, created_at: _c, updated_at: _u, ...rest }) => ({
          ...rest,
          case_slug: toSlug,
        }),
      );
      await supabase.from("phone_calls").insert(cloned);
    }

    // 4. phone_messages
    const { data: messages } = await supabase
      .from("phone_messages")
      .select("*")
      .eq("case_slug", fromSlug);
    if (messages && messages.length > 0) {
      const cloned = (messages as DbPhoneMessage[]).map(
        ({ id: _id, created_at: _c, updated_at: _u, ...rest }) => ({
          ...rest,
          case_slug: toSlug,
        }),
      );
      await supabase.from("phone_messages").insert(cloned);
    }

    // 5. phone_photos
    const { data: photos } = await supabase
      .from("phone_photos")
      .select("*")
      .eq("case_slug", fromSlug);
    if (photos && photos.length > 0) {
      const cloned = (photos as DbPhonePhoto[]).map(
        ({ id: _id, created_at: _c, updated_at: _u, ...rest }) => ({
          ...rest,
          case_slug: toSlug,
        }),
      );
      await supabase.from("phone_photos").insert(cloned);
    }

    // 6. phone_notes
    const { data: notes } = await supabase
      .from("phone_notes")
      .select("*")
      .eq("case_slug", fromSlug);
    if (notes && notes.length > 0) {
      const cloned = (notes as DbPhoneNote[]).map(
        ({ id: _id, created_at: _c, updated_at: _u, ...rest }) => ({
          ...rest,
          case_slug: toSlug,
        }),
      );
      await supabase.from("phone_notes").insert(cloned);
    }

    // 7. phone_bank_transactions
    const { data: txs } = await supabase
      .from("phone_bank_transactions")
      .select("*")
      .eq("case_slug", fromSlug);
    if (txs && txs.length > 0) {
      const cloned = (txs as DbPhoneBankTx[]).map(
        ({ id: _id, created_at: _c, updated_at: _u, ...rest }) => ({
          ...rest,
          case_slug: toSlug,
        }),
      );
      await supabase.from("phone_bank_transactions").insert(cloned);
    }

    // 8. phone_browser_history
    const { data: history } = await supabase
      .from("phone_browser_history")
      .select("*")
      .eq("case_slug", fromSlug);
    if (history && history.length > 0) {
      const cloned = (history as DbPhoneBrowserHistory[]).map(
        ({ id: _id, created_at: _c, updated_at: _u, ...rest }) => ({
          ...rest,
          case_slug: toSlug,
        }),
      );
      await supabase.from("phone_browser_history").insert(cloned);
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── 11. Storage: Upload Phone Asset ──

export async function uploadPhoneAsset(formData: FormData) {
  try {
    await requireAdminAuth();
    const supabase = await createClient();

    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "photos";
    const rawCaseSlug = formData.get("caseSlug") as string | null;
    if (!rawCaseSlug) return { success: false, error: "Thiếu mã vụ án (caseSlug)." };
    const caseSlug = normalizeCaseId(rawCaseSlug);

    if (!file || file.size === 0) {
      return { success: false, error: "File không hợp lệ hoặc rỗng." };
    }

    const ext = file.name.split(".").pop() || "bin";
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `cases/${caseSlug}/${folder}/${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("phone-assets")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("phone-assets")
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        path: filePath,
        url: publicUrlData.publicUrl,
      },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}
