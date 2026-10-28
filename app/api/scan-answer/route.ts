import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { rateLimitResponse } from '@/lib/security/defensive-cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeCaseId } from '@/lib/cases/case-id'
import { getInterrogationCriteria } from '@/lib/ai/suspect-interrogation-context'
import { parseRuntimeHints } from '@/lib/cms/checkpoint-runtime'
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
  const hint = parseRuntimeHints(checkpoint?.hints)[0]?.text
  return getInterrogationCriteria(String(body.suspect || ''), category, {
    title: checkpoint?.title,
    question: checkpoint?.question,
    hint,
    aiContext: checkpoint?.ai_context || undefined,
    aiValidCases: asStringArray(checkpoint?.ai_valid_cases),
    aiInvalidCases: asStringArray(checkpoint?.ai_invalid_cases),
    motiveContext: asString(cfg.motiveContext || cfg.motive_context) || undefined,
    contradictionContext:
      asString(cfg.contradictionContext || cfg.contradiction_context) || undefined,
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

    if (!answer.trim() || answer.length > MAX_ANSWER_CHARS) {
      return NextResponse.json(
        { isCorrect: false, feedback: 'Thiếu hoặc quá dài câu trả lời để kiểm tra.' },
        { status: 400 }
      )
    }

    const { context, validCases, invalidCases } = await loadCriteria(body, category)

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { isCorrect: false, feedback: 'Chưa cấu hình GEMINI_API_KEY trong .env.local.' },
        { status: 500 }
      )
    }

    // Format các ví dụ mẫu ĐẠT (nếu có)
    const validExamplesText = validCases.length > 0
      ? `=== CÁC VÍ DỤ MẪU ĐƯỢC CHẤP NHẬN (ĐẠT / PASS) ===\n` +
        validCases
          .map((c, i) => {
            if (typeof c === 'string') return `${i + 1}. "${c}"`
            return `${i + 1}. "${c.text}" ${c.reason ? `(Lý do đạt: ${c.reason})` : ''}`
          })
          .join('\n') + '\n==================================================='
      : ''

    // Format các ví dụ mẫu TRƯỢT (nếu có)
    const invalidExamplesText = invalidCases.length > 0
      ? `=== CÁC VÍ DỤ MẪU BẮT BUỘC ĐÁNH TRƯỢT (KHÔNG ĐẠT / FAIL) ===\n` +
        invalidCases
          .map((c, i) => {
            if (typeof c === 'string') return `${i + 1}. "${c}"`
            return `${i + 1}. "${c.text}" ${c.reason ? `(Lý do trượt: ${c.reason})` : ''}`
          })
          .join('\n') + '\n============================================================'
      : ''

    const prompt = `
Bạn là Giám Khảo Điều Tra Hình Sự & Giám Định Pháp Y nghiêm cẩn, khách quan và sắc sảo.

=== BỐI CẢNH / SỰ THẬT (GROUND TRUTH) ===
${context.trim()}
=========================================

${validExamplesText}

${invalidExamplesText}

=== CÂU TRẢ LỜI CỦA NGƯỜI CHƠI ===
"${answer.trim()}"
==================================

QUY TẮC THẨM ĐỊNH NGHIỆP VỤ (BẮT BUỘC TUÂN THỦ):
1. NGUYÊN TẮC QUAN TRỌNG:
   - Học ranh giới logic từ các ví dụ mẫu ĐẠT và KHÔNG ĐẠT ở trên (nếu có).
   - Tuyệt đối KHÔNG ĐƯỢC "suy diễn hộ" người chơi. Nếu câu trả lời quá ngắn, quá mơ hồ hoặc tương đồng với các ví dụ KHÔNG ĐẠT (thiếu tên, thiếu nhân chứng, thiếu hoàn cảnh) -> BẮT BUỘC ĐÁNH TRƯỢT: "isCorrect": false.
   - Khi đánh trượt: TUYỆT ĐỐI CẤM khen người chơi "đã xác định đúng một phần" hay "đúng đối tượng". Bắt buộc phản hồi thẳng thắn là nhận định vô căn cứ hoặc thiếu chứng cứ/nguồn tin chứng minh.

2. ĐIỀU KIỆN ĐỂ ĐẠT ("isCorrect": true):
   - Người chơi nêu được KẾT LUẬN kèm theo ít nhất một CĂN CỨ HỢP LÝ (nhân chứng cụ thể, tài liệu, mốc thời gian, nguyên nhân hoặc hoàn cảnh xảy ra sự việc khớp với bối cảnh hoặc chuẩn tương đương các ví dụ mẫu ĐẠT).
   - Điểm confidenceScore từ 80 đến 100.
   - Phản hồi: Xác nhận kết luận chính xác, có viện dẫn căn cứ chứng minh.

3. ĐIỀU KIỆN ĐÁNH TRƯỢT ("isCorrect": false):
   - Nói khơi khơi, phán đoán mù mờ, hoặc thiếu chứng cứ/nhân chứng/hoàn cảnh cụ thể.
   - Điểm confidenceScore từ 0 đến 30.
   - Phản hồi: Chỉ ra nhận định thiếu căn cứ hoặc thiếu dữ kiện chứng minh.

BẮT BUỘC TRẢ VỀ DUY NHẤT 1 CHUỖI JSON HỢP LỆ THEO SCHEMA:
{
  "isCorrect": boolean,
  "confidenceScore": number,
  "feedback": "Lời nhận xét của Giám khảo hình sự (1-2 câu tiếng Việt)"
}
`

    // Ưu tiên gemini-2.5-flash-lite (hoặc fallback gemini-3.5-flash-lite)
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      }
    )

    if (!response.ok) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          })
        }
      )
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
