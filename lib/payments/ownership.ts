import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface Ownership {
  /** Bought online through PayOS (or granted by hand). */
  online: boolean;
  /** Redeemed a box code. */
  box: boolean;
  /** Online group rooms left. Box owners create rooms for free. */
  groupCredits: number;
}

export const NOT_OWNED: Ownership = {
  online: false,
  box: false,
  groupCredits: 0,
};

export function ownsCase(o: Ownership): boolean {
  return o.online || o.box;
}

/**
 * When false (default), nobody is blocked: pages show ownership but /play and
 * room creation stay open. Turn on with PLAY_GATING_ENABLED=true once PayOS
 * works and box codes are printed.
 */
export function isPlayGatingEnabled(): boolean {
  return process.env.PLAY_GATING_ENABLED?.trim() === "true";
}

/**
 * Server half of the play gate for the /play/<case_id>/board, /box and /phone routes.
 * true: render the page. false: the client guard (CaseAccessGuard) still lets
 * the visitor in when this device holds a room session of the case (an invited
 * player), otherwise sends them to /cases/<case_id>.
 * A `?room=` link always passes: only the Host needs to own the case.
 */
export async function serverAllowsPlay(
  caseId: string,
  roomParam: string | undefined,
): Promise<boolean> {
  if (!isPlayGatingEnabled() || roomParam) return true;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return ownsCase(await getOwnership(user?.id, caseId));
}

/** All licenses of a user, keyed by case slug. Missing table: empty. */
export async function getOwnedCases(
  userId: string | null | undefined,
): Promise<Record<string, Ownership>> {
  if (!userId) return {};
  const { data, error } = await createAdminClient()
    .from("licenses")
    .select("case_id, online_at, box_activated_at, group_credits")
    .eq("user_id", userId);
  if (error || !data) return {};
  const out: Record<string, Ownership> = {};
  for (const row of data) {
    out[row.case_id] = {
      online: Boolean(row.online_at),
      box: Boolean(row.box_activated_at),
      groupCredits: row.group_credits ?? 0,
    };
  }
  return out;
}

/** Reads the license row with the service role. Missing table or row: not owned. */
export async function getOwnership(
  userId: string | null | undefined,
  caseId: string,
): Promise<Ownership> {
  if (!userId) return NOT_OWNED;
  const { data, error } = await createAdminClient()
    .from("licenses")
    .select("online_at, box_activated_at, group_credits")
    .eq("user_id", userId)
    .eq("case_id", caseId)
    .maybeSingle();
  if (error || !data) return NOT_OWNED;
  return {
    online: Boolean(data.online_at),
    box: Boolean(data.box_activated_at),
    groupCredits: data.group_credits ?? 0,
  };
}
