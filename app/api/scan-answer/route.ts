import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { rateLimitResponse } from '@/lib/security/defensive-cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeCaseId } from '@/lib/cases/case-id'
import {
  buildGraderInstruction,
  getInterrogationCriteria,
  wrapPlayerAnswer,
} from '@/lib/ai/suspect-interrogation-context'
import { asString, asStringArray } from '@/lib/text'
import type { DbCaseCheckpoint } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

interface RequestBody {
  caseId?: string
  checkpointId?: string
  category?: string
  suspect?: string
  answer?: string
}

const MAX_ANSWER_CHARS = 1000

/** Đọc tiêu chí AI của checkpoint ở server; client chỉ gửi câu trả lời. */
async function loadCriteria(body: RequestBody, category: 'motive' | 'contradiction') {
  let checkpoint: DbCaseCheckpoint | null = null
  if (body.checkpointId) {
    const { data } = await createAdminClient()
      .from('case_checkpoints')
      .select('*')
      .eq('case_id', normalizeCaseId(body.caseId || 'case_000'))
      .eq('checkpoint_id', body.checkpointId)
      .maybeSingle()
    checkpoint = (data as DbCaseCheckpoint | null) ?? null
  }
  const cfg = (checkpoint?.answer_config ?? {}) as Record<string, unknown>
  return getInterrogationCriteria(String(body.suspect || ''), category, {
    title: checkpoint?.title,
    question: checkpoint?.question,
    aiContext: checkpoint?.ai_context || undefined,
    aiValidCases: asStringArray(checkpoint?.ai_valid_cases),
    aiInvalidCases: asStringArray(checkpoint?.ai_invalid_cases),
    motiveContext: asString(cfg.motiveContext || cfg.motive_context) || undefined,
    contradictionContext:
      asString(cfg.contradictionContext || cfg.contradiction_context) || undefined,
    motiveValidCases: asStringArray(cfg.motiveValidCases),
    motiveInvalidCases: asStringArray(cfg.motiveInvalidCases),
    contradictionValidCases: asStringArray(cfg.contradictionValidCases),
    contradictionInvalidCases: asStringArray(cfg.contradictionInvalidCases),
  })
}

/** Gọi Gemini: chỉ dẫn ở `systemInstruction`, câu trả lời người chơi ở `contents`. */
function callGemini(model: string, apiKey: string, instruction: string, answer: string) {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instruction }] },
      contents: [{ role: 'user', parts: [{ text: wrapPlayerAnswer(answer) }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  })
}

export async function POST(req: Request) {
  const rate = checkRateLimit(`scan_answer:${getClientIp(req)}`, { limit: 10, windowMs: 60_000 })
  if (!rate.allowed) {
    return rateLimitResponse(rate.retryAfterSeconds, 'Bạn gửi lập luận quá nhanh. Vui lòng thử lại sau giây lát.')
  }

  try {
    const body: RequestBody = await req.json()
    const answer = typeof body.answer === 'string' ? body.answer : ''
    const category = body.category === 'contradiction' ? 'contradiction' : 'motive'

    if (answer.length > MAX_ANSWER_CHARS) {
      // 200 + trượt: client chỉ cho qua khi server lỗi (5xx), không cho qua lỗi đầu vào.
      return NextResponse.json({
        isCorrect: false,
        confidenceScore: 0,
        feedback: `Lập luận quá dài (tối đa ${MAX_ANSWER_CHARS} ký tự).`,
      })
    }

    const criteria = await loadCriteria(body, category)

    if (!answer.trim()) {
      // Checkpoint có bối cảnh AI do GM biên soạn thì bắt buộc có lập luận.
      return NextResponse.json(
        criteria.hasAuthoredContext
          ? {
              isCorrect: false,
              confidenceScore: 0,
              feedback: 'Cần nhập lập luận kèm căn cứ trước khi xác nhận.',
            }
          : { isCorrect: true, confidenceScore: 0, feedback: '' }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { isCorrect: false, feedback: 'Chưa cấu hình GEMINI_API_KEY trong .env.local.' },
        { status: 500 }
      )
    }

    const instruction = buildGraderInstruction(criteria)

    // Ưu tiên gemini-2.5-flash-lite (hoặc fallback gemini-3.5-flash-lite)
    let response = await callGemini('gemini-2.5-flash-lite', apiKey, instruction, answer)
    if (!response.ok) {
      response = await callGemini('gemini-3.5-flash-lite', apiKey, instruction, answer)
    }

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API Error:', errText)
      return NextResponse.json(
        { isCorrect: false, feedback: `Lỗi kết nối Gemini API (${response.status})` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textOutput) {
      return NextResponse.json(
        { isCorrect: false, feedback: 'AI không trả về kết quả hợp lệ.' },
        { status: 500 }
      )
    }

    let parsed: { isCorrect?: unknown; confidenceScore?: unknown; feedback?: unknown }
    try {
      parsed = JSON.parse(textOutput)
    } catch {
      console.error('Gemini returned invalid JSON:', textOutput)
      return NextResponse.json(
        { isCorrect: false, feedback: 'AI trả về dữ liệu không hợp lệ, vui lòng thử lại.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      isCorrect: !!parsed.isCorrect,
      confidenceScore:
        typeof parsed.confidenceScore === 'number'
          ? Math.max(0, Math.min(100, Math.round(parsed.confidenceScore)))
          : 0,
      feedback: typeof parsed.feedback === 'string' ? parsed.feedback : ''
    })
  } catch (error) {
    console.error('Error scanning answer:', error)
    return NextResponse.json(
      { isCorrect: false, feedback: 'Lỗi xử lý server nội bộ.' },
      { status: 500 }
    )
  }
}
