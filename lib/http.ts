import { NextResponse } from "next/server";

/** JSON response that proxies and browsers must not cache. */
export function noStoreJson(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
