import { NextRequest, NextResponse } from "next/server";
import type { MapVectorData } from "@/types/map-vector";
import { createClient } from "@/lib/supabase/server";

// Module-level in-process cache: avoids re-reading from database on every request (TTL: 10 minutes)
let _mapCache: { data: MapVectorData; cachedAt: number } | null = null;

export async function GET(_req: NextRequest) {
  try {
    const now = Date.now();
    if (_mapCache && now - _mapCache.cachedAt < 10 * 60 * 1000) {
      return NextResponse.json(
        { success: true, data: _mapCache.data, source: "cache" },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        },
      );
    }

    const supabase = await createClient();
    const { data: row, error: dbError } = await supabase
      .from("map_vectors")
      .select("data")
      .eq("id", "world")
      .maybeSingle();

    if (dbError) {
      console.error("[API /api/map-vector] DB fetch error:", dbError);
      return NextResponse.json(
        { success: false, error: dbError.message },
        { status: 500 },
      );
    }

    if (!row || !row.data) {
      return NextResponse.json(
        { success: false, error: "Unified world vector map data not found" },
        { status: 404 },
      );
    }

    const parsedData = row.data as MapVectorData;
    _mapCache = { data: parsedData, cachedAt: now };

    return NextResponse.json(
      { success: true, data: parsedData, source: "database" },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error: unknown) {
    console.error("[API /api/map-vector] GET error:", error);
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Failed to fetch map vector data";
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 },
    );
  }
}
