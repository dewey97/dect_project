import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import {
  PlayRoomClient,
  type PlayCaseInfo,
} from "@/components/play/play-room-client";

export const dynamic = "force-dynamic";

/**
 * Màn vào game của một vụ án (spec 2.3).
 * QR tĩnh trong nắp hộp: `/play/<case_id>?mode=box`. QR động của phòng: `/play/<case_id>?room=<CODE>`.
 */
export default async function PlayPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId: raw } = await params;
  if (!isValidCaseId(raw)) notFound();
  const caseId = normalizeCaseId(raw);

  const supabase = await createClient();
  const { data } = await supabase
    .from("cases")
    .select("slug, title, synopsis, cover_image_url")
    .eq("slug", caseId)
    .maybeSingle();
  if (!data) notFound();

  const info: PlayCaseInfo = {
    caseId,
    title: data.title,
    synopsis: data.synopsis ?? null,
    coverImageUrl: data.cover_image_url ?? null,
  };
  return <PlayRoomClient info={info} />;
}
