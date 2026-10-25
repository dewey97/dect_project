import { NextRequest, NextResponse } from "next/server";
import type { MapVectorData } from "@/types/map-vector";
import { denyIfNotAdmin } from "@/lib/security/admin-route-guard";
import { createClient } from "@/lib/supabase/server";

// Module-level in-process cache: avoids re-reading from database on every request.
// Invalidated automatically when the POST handler saves a new version.
let _mapCache: { data: MapVectorData; cachedAt: number } | null = null;

export async function GET(_req: NextRequest) {
  try {
    // Serve from in-process cache if available (TTL: 10 minutes)
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
      console.error("[API /api/admin/map-vector] DB fetch error:", dbError);
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
    console.error("[API /api/admin/map-vector] GET error:", error);
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

export async function POST(req: NextRequest) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const caseId = body.caseId || "case_000";
    const mapData: MapVectorData = body.mapData;

    if (!mapData || !mapData.water || !mapData.roads) {
      return NextResponse.json(
        { success: false, error: "Invalid map vector payload structure" },
        { status: 400 },
      );
    }

    const dataToSave: MapVectorData = {
      ...mapData,
      caseId,
      updatedAt: new Date().toISOString(),
    };

    const supabase = await createClient();
    const { error: dbError } = await supabase.from("map_vectors").upsert(
      {
        id: "world",
        data: dataToSave,
        updated_at: dataToSave.updatedAt,
      },
      { onConflict: "id" },
    );

    if (dbError) {
      console.error("[API /api/admin/map-vector] DB upsert error:", dbError);
      return NextResponse.json(
        { success: false, error: dbError.message },
        { status: 500 },
      );
    }

    // Invalidate in-process GET cache so next read picks up the new data
    _mapCache = null;

    return NextResponse.json({
      success: true,
      message: "Unified world map vector data saved successfully",
      updatedAt: dataToSave.updatedAt,
    });
  } catch (error: unknown) {
    console.error("[API /api/admin/map-vector] POST error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Failed to save map vector data";
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 },
    );
  }
}
