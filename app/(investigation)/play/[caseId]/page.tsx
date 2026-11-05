import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import {
  getOwnership,
  isPlayGatingEnabled,
  ownsCase,
} from "@/lib/payments/ownership";
import {
  PlayRoomClient,
  type PlayCaseInfo,
} from "@/components/play/play-room-client";

export const dynamic = "force-dynamic";

/**
 * Màn vào game của một vụ án (spec 2.3).
 * QR động của phòng: `/play/<case_id>?room=<CODE>`.
 *
 * Khi bật PLAY_GATING_ENABLED: chưa sở hữu (mua online hoặc kích hoạt hộp) thì
 * chuyển về trang vụ án. Link có `?room=` không bị chặn: người được mời vào
 * phòng không cần mua, chỉ Host cần.
 */
export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<{ room?: string }>;
}) {
  const [{ caseId: raw }, query] = await Promise.all([params, searchParams]);
  if (!isValidCaseId(raw)) notFound();
  const caseId = normalizeCaseId(raw);

  const supabase = await createClient();

  if (isPlayGatingEnabled() && !query.room) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!ownsCase(await getOwnership(user?.id, caseId))) {
      redirect(`/cases/${caseId}`);
    }
  }

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
