import { NextResponse } from 'next/server'
import { CASE_000_MASTER_STORYLINE } from '@/content/cases/case-000/storyline-data'

export async function POST(req: Request) {
  try {
    const { inputText, currentPhase, findings } = await req.json()

    if (!inputText || typeof inputText !== 'string') {
      return NextResponse.json({ matched: false, error: 'Invalid input' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    // If API Key is missing or placeholder, signal fallback to keyword matcher
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json({ matched: false, fallback: true })
    }

    const prompt = `
Bạn là Trợ Lý Giám Định Viên Trinh Thám Pháp Y Cao Cấp trong trò chơi điều tra chuyên án.

=== TOÀN BỘ CỐT TRUYỆN GỐC & DIỄN BIẾN THỰC TẾ VỤ ÁN ===
${CASE_000_MASTER_STORYLINE}
==========================================================

Nhiệm vụ của bạn:
Phân tích câu suy luận/phát hiện của người chơi: "${inputText.trim()}" dựa trực tiếp trên TOÀN BỘ CỐT TRUYỆN GỐC ở trên (Giai đoạn điều tra hiện tại: ${currentPhase ?? 0}).

Quy tắc phán quyết & tự đúc rút manh mối từ Cốt truyện:
1. Đọc kỹ câu gõ của người chơi. Tự bạn đối soát với Cốt truyện gốc xem câu gõ này có chứa đựng một SỰ THẬT / BÍ MẬT / CHỨNG CỨ CHÍNH XÁC nào trong vụ án hay không.
2. Nếu câu gõ thể hiện ĐÚNG BẢN CHẤT MỘT SỰ THẬT VỤ ÁN:
   - Đặt matched = true.
   - TỰ BẠN ĐÚC RÚT và viết ra:
     + "title": Tiêu đề manh mối sắc bác ngắn gọn (Dưới 12 từ).
     + "description": Trích dẫn nội dung phân tích pháp y/lời khai tổng hợp từ Cốt truyện (Dưới 45 từ).
   - Nếu suy luận này giải quyết một mốc khám phá mấu chốt của vụ án (như: mốc giờ tử vong 20h vs 21h, di chúc bị làm giả hóa chất, Tùng bỏ chạy 20:15, sự cố trốn tìm 1998, Hà lỡ lời hiện trường, tin nhắn tình nhân 20:40...), hãy đặt isKeyFinding = true.
3. Nếu câu gõ SAI SỰ THẬT vụ án hoặc chỉ là nhận xét cảm xúc/ghi chú thông thường không chứa sự thật cốt truyện, đặt matched = false.

BẮT BUỘC trả về duy nhất 1 chuỗi JSON hợp lệ theo đúng cấu trúc:
{
  "matched": boolean,
  "title": "Tiêu đề do AI tự đúc rút từ cốt truyện (Nêu ngắn gọn)",
  "description": "Phân tích bóc tách chi tiết do AI tự đúc rút từ cốt truyện",
  "isKeyFinding": boolean,
  "findingId": "mã_finding_hoặc_ai_generated",
  "reasoning": "Giải thích ngắn gọn"
}
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      }
    )

    if (!response.ok) {
      console.warn('Gemini API call failed, falling back to keyword matcher.')
      return NextResponse.json({ matched: false, fallback: true })
    }

    const data = await response.json()
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textOutput) {
      return NextResponse.json({ matched: false, fallback: true })
    }

    const result = JSON.parse(textOutput)
    return NextResponse.json({
      matched: !!result.matched,
      title: result.title || '',
      description: result.description || '',
      isKeyFinding: !!result.isKeyFinding,
      findingId: result.findingId || `ai-finding-${Date.now()}`,
      reasoning: result.reasoning || '',
      aiVerified: true
    })
  } catch (err) {
    console.error('Error in verify-finding API:', err)
    return NextResponse.json({ matched: false, fallback: true })
  }
}
