import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getDefaultMapVectorData } from '@/lib/map-vector-utils'
import type { MapVectorData } from '@/types/map-vector'

export const dynamic = 'force-dynamic'

const MAPS_DIR = path.join(process.cwd(), 'data', 'maps')

function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const caseId = searchParams.get('caseId') || 'case_000'

    ensureDirExists(MAPS_DIR)
    const filePath = path.join(MAPS_DIR, `${caseId}_vector.json`)

    if (!fs.existsSync(filePath)) {
      const defaultData = getDefaultMapVectorData(caseId)
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8')
      return NextResponse.json({ success: true, data: defaultData, source: 'seed' })
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed: MapVectorData = JSON.parse(raw)

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
    const filePath = path.join(MAPS_DIR, `${caseId}_vector.json`)

    const dataToSave: MapVectorData = {
      ...mapData,
      caseId,
      updatedAt: new Date().toISOString()
    }

    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'Map vector data saved successfully',
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
