import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { MapVectorData } from '@/types/map-vector'

export const dynamic = 'force-dynamic'

const MAPS_DIR = path.join(process.cwd(), 'data', 'maps')

function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const WORLD_MAP_FILE = 'world_vector_map.json'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const caseId = searchParams.get('caseId')

    ensureDirExists(MAPS_DIR)
    
    // 1. Ưu tiên bản đồ thế giới mở rộng dùng chung duy nhất (world_vector_map.json)
    const worldFilePath = path.join(MAPS_DIR, WORLD_MAP_FILE)
    const caseFilePath = caseId ? path.join(MAPS_DIR, `${caseId}_vector.json`) : null
    
    let filePath = worldFilePath
    if (!fs.existsSync(worldFilePath) && caseFilePath && fs.existsSync(caseFilePath)) {
      filePath = caseFilePath
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Unified world vector map data not found' },
        { status: 404 }
      )
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed: MapVectorData = JSON.parse(raw)

    // Nếu người chơi gọi theo vụ án cụ thể, có thể gắn cờ phân loại POI cho vụ án đó
    // nhưng giữ nguyên toàn bộ địa lý (đường, sông hồ, công trình, cầu cống) của bản đồ thế giới chung
    return NextResponse.json({ success: true, data: parsed, source: 'file' })
  } catch (error: any) {
    console.error('[API /api/admin/map-vector] GET error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch map vector data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const caseId = body.caseId || 'case_000'
    const mapData: MapVectorData = body.mapData

    if (!mapData || !mapData.water || !mapData.roads) {
      return NextResponse.json(
        { success: false, error: 'Invalid map vector payload structure' },
        { status: 400 }
      )
    }

    ensureDirExists(MAPS_DIR)
    
    const dataToSave: MapVectorData = {
      ...mapData,
      caseId,
      updatedAt: new Date().toISOString()
    }

    // Luôn lưu vào Bản đồ Thế Giới Dùng Chung (world_vector_map.json)
    const worldFilePath = path.join(MAPS_DIR, WORLD_MAP_FILE)
    fs.writeFileSync(worldFilePath, JSON.stringify(dataToSave, null, 2), 'utf-8')

    // Đồng bộ thêm vào case_000_vector.json để tương thích ngược tuyệt đối
    const legacyCaseFilePath = path.join(MAPS_DIR, 'case_000_vector.json')
    fs.writeFileSync(legacyCaseFilePath, JSON.stringify(dataToSave, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'Unified world map vector data saved successfully',
      updatedAt: dataToSave.updatedAt
    })
  } catch (error: any) {
    console.error('[API /api/admin/map-vector] POST error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save map vector data' },
      { status: 500 }
    )
  }
}
