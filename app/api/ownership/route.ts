import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidCaseId, normalizeCaseId } from "@/lib/cases/case-id";
import { getOwnership } from "@/lib/payments/ownership";

export const dynamic = "force-dynamic";

/** Ownership of one case for the current visitor. Used by the landing carousel. */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("caseId");
  if (!isValidCaseId(raw)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const caseId = normalizeCaseId(raw);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownership = await getOwnership(user?.id, caseId);

  return NextResponse.json(
    { caseId, loggedIn: Boolean(user), ...ownership },
    { headers: { "Cache-Control": "no-store" } },
  );
}
