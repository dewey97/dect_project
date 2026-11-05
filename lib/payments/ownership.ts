import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

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
