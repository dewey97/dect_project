import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import {
  PlayLobbyClient,
  type PlayCaseInfo,
} from "@/components/play/play-room-client";

export const dynamic = "force-dynamic";

/**
 * Phòng chờ của phòng chơi nhóm: `/play/<case_id>/lobby?room=CODE`.
 * Không cần sở hữu vụ án: chỉ thiết bị đã vào phòng (có phiên) mới ở lại,
 * còn lại PlayLobbyClient đưa về `/play/<case_id>?room=CODE` để nhập tên.
 */
export default async function LobbyPage({
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
    access: null,
  };
  return <PlayLobbyClient info={info} />;
}
