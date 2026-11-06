import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_CASE_ID,
  isValidCaseId,
  normalizeCaseId,
} from "@/lib/cases/case-id";
import { STUDIO_CASE_COOKIE } from "@/lib/studio/case-scope";

/**
 * Case the Studio works on: `?case=` in the URL, else the case picked in the
 * sidebar (cookie), else case_000. Every case-scoped Studio page reads it here.
 */
export async function getStudioCaseId(
  fromUrl?: string | null,
): Promise<string> {
  if (isValidCaseId(fromUrl)) return normalizeCaseId(fromUrl);
  const saved = (await cookies()).get(STUDIO_CASE_COOKIE)?.value;
  return isValidCaseId(saved) ? normalizeCaseId(saved) : DEFAULT_CASE_ID;
}
