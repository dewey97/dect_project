import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import {
  getOwnership,
  isPlayGatingEnabled,
  ownsCase,
} from "@/lib/payments/ownership";
import { CaseAccessGuard } from "@/components/cases/case-access-guard";
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
 * về trang vụ án. Không chặn link có `?room=` và thiết bị đang có phiên phòng
 * của vụ này: người được mời vào phòng không cần mua, chỉ Host cần.
 * Cùng quy tắc với serverAllowsPlay; ở đây tính trực tiếp để có luôn số lượt nhóm.
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
  const [{ data }, { data: userData }] = await Promise.all([
    supabase
      .from("cases")
      .select("slug, title, synopsis, cover_image_url")
      .eq("slug", caseId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!data) notFound();

  const gating = isPlayGatingEnabled();
  const ownership = await getOwnership(userData.user?.id, caseId);
  const allowed = !gating || Boolean(query.room) || ownsCase(ownership);

  const info: PlayCaseInfo = {
    caseId,
    title: data.title,
    synopsis: data.synopsis ?? null,
    coverImageUrl: data.cover_image_url ?? null,
    access: gating ? ownership : null,
  };
  return (
    <CaseAccessGuard caseId={caseId} allowed={allowed}>
      <PlayRoomClient info={info} />
    </CaseAccessGuard>
  );
}
