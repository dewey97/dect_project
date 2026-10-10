import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_DIR = path.resolve(process.cwd(), "data");
const HOTSPOTS_FILE = path.join(DATA_DIR, "case_000_hotspots.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// GET: Lấy cấu hình Hotspots đã lưu
export async function GET() {
  try {
    ensureDirectoryExists();
    if (fs.existsSync(HOTSPOTS_FILE)) {
      const content = fs.readFileSync(HOTSPOTS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return NextResponse.json({ success: true, hotspots: parsed });
    }
    return NextResponse.json({ success: true, hotspots: null });
  } catch (error: any) {
    console.error("Error reading hotspots file:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Lưu vĩnh viễn cấu hình Hotspots (vị trí + ảnh gán theo ID)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotspots } = body;

    if (!Array.isArray(hotspots)) {
      return NextResponse.json(
        { success: false, error: "hotspots must be an array" },
        { status: 400 }
      );
    }

    ensureDirectoryExists();
    fs.writeFileSync(HOTSPOTS_FILE, JSON.stringify(hotspots, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing hotspots file:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
