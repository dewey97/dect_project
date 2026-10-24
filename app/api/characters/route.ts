import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCaseId } from "@/lib/cases/case-id";
import type { DbCaseCharacter } from "@/lib/types/database";

export const dynamic = "force-dynamic";

/** Danh sách nhân vật của một vụ án (Case Bible) cho runtime gameplay. */
export async function GET(request: Request) {
  const caseId = normalizeCaseId(
    new URL(request.url).searchParams.get("caseId"),
  );

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_characters")
      .select("*")
      .eq("case_slug", caseId)
      .order("slot_index", { ascending: true });

    if (error) throw error;

    const characters = (data || []) as DbCaseCharacter[];

    // Bổ sung ảnh từ legacy evidence nếu nhân vật chưa có avatar_url
    const missingAvatarCodes = characters
      .filter((c) => !c.avatar_url && c.avatar_code)
      .map((c) => c.avatar_code as string);

    const legacyMap: Record<string, string> = {};
    if (missingAvatarCodes.length > 0) {
      const { data: evidences } = await supabase
        .from("case_evidence")
        .select("code, file_url, thumb_url")
        .eq("case_slug", caseId)
        .in("code", missingAvatarCodes);

      if (evidences) {
        for (const ev of evidences) {
          const u = ev.thumb_url || ev.file_url;
          if (u && ev.code) {
            legacyMap[ev.code.toLowerCase().trim()] = u;
          }
        }
      }

      const stillMissing = missingAvatarCodes.filter(
        (code) => !legacyMap[code.toLowerCase().trim()],
      );
      if (stillMissing.length > 0) {
        const { data: photos } = await supabase
          .from("phone_photos")
          .select("photo_code, image_url")
          .eq("case_slug", caseId)
          .in("photo_code", stillMissing);

        if (photos) {
          for (const p of photos) {
            if (p.image_url && p.photo_code) {
              legacyMap[p.photo_code.toLowerCase().trim()] = p.image_url;
            }
          }
        }
      }
    }

    const resolved = characters.map((c) => {
      const legacy = c.avatar_code
        ? legacyMap[c.avatar_code.toLowerCase().trim()]
        : null;
      return {
        ...c,
        avatar_url: c.avatar_url || legacy || null,
      };
    });

    return NextResponse.json(
      { success: true, caseId, data: resolved },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    console.error("Error loading case characters:", error);
    return NextResponse.json(
      {
        success: false,
        caseId,
        data: [],
        error:
          error instanceof Error ? error.message : "Không tải được nhân vật.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
