import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { MapVectorData } from "@/types/map-vector";
import { denyIfNotAdmin } from "@/lib/security/admin-route-guard";
import { createClient } from "@/lib/supabase/server";

// NOTE: dynamic = 'force-dynamic' intentionally removed so Next.js can serve cached responses.
// The map JSON only changes when admin saves via POST — no need to bypass HTTP cache on every read.

const MAPS_DIR = path.join(process.cwd(), "data", "maps");

function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const WORLD_MAP_FILE = "world_vector_map.json";

// Module-level in-process cache: avoids re-reading & re-parsing the 1.5MB JSON on every request.
// Invalidated automatically when the POST handler saves a new version (bumps cachedAt).
let _mapCache: { data: MapVectorData; cachedAt: number } | null = null;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId");

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

    // 1. Thử đọc từ Supabase bảng map_vectors (id = 'world')
    try {
      const supabase = await createClient();
      const { data: row, error: dbError } = await supabase
        .from("map_vectors")
        .select("data")
        .eq("id", "world")
        .maybeSingle();

      if (!dbError && row && row.data) {
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
      }
    } catch (dbErr) {
      console.warn(
        "[API /api/admin/map-vector] DB fetch fallback to file:",
        dbErr,
      );
    }

    // 2. Fallback đọc file cục bộ (world_vector_map.json)
    ensureDirExists(MAPS_DIR);
    const worldFilePath = path.join(MAPS_DIR, WORLD_MAP_FILE);
    const caseFilePath = caseId
      ? path.join(MAPS_DIR, `${caseId}_vector.json`)
      : null;

    let filePath = worldFilePath;
    if (
      !fs.existsSync(worldFilePath) &&
      caseFilePath &&
      fs.existsSync(caseFilePath)
    ) {
      filePath = caseFilePath;
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "Unified world vector map data not found" },
        { status: 404 },
      );
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed: MapVectorData = JSON.parse(raw);

    // Store in module-level cache
    _mapCache = { data: parsed, cachedAt: now };

    return NextResponse.json(
      { success: true, data: parsed, source: "file" },
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

    // 1. Lưu vào Supabase bảng map_vectors (id = 'world')
    try {
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
        console.error(
          "[API /api/admin/map-vector] DB upsert warning:",
          dbError,
        );
      }
    } catch (dbErr) {
      console.error("[API /api/admin/map-vector] DB connection error:", dbErr);
    }

    // 2. Ghi file backup cục bộ (world_vector_map.json)
    //    LƯU Ý: Bỏ ghi case_000_vector.json legacy theo quy chuẩn bản đồ thế giới dùng chung duy nhất
    ensureDirExists(MAPS_DIR);
    const worldFilePath = path.join(MAPS_DIR, WORLD_MAP_FILE);
    fs.writeFileSync(
      worldFilePath,
      JSON.stringify(dataToSave, null, 2),
      "utf-8",
    );

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
