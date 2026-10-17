import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface RequestBody {
  context: string
  answer: string
}

export async function POST(req: Request) {
  try {
    const { context, answer }: RequestBody = await req.json()

    if (!context || !answer) {
      return NextResponse.json(
        { isCorrect: false, feedback: 'Thiếu bối cảnh hoặc câu trả lời để kiểm tra.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { isCorrect: false, feedback: 'Chưa cấu hình GEMINI_API_KEY trong .env.local.' },
        { status: 500 }
      )
    }

    const prompt = `
Bạn là Giám Khảo Điều Tra Hình Sự & Giám Định Pháp Y sắc sảo.

=== BỐI CẢNH / SỰ THẬT (GROUND TRUTH) ===
${context.trim()}
=========================================

=== CÂU TRẢ LỜI CỦA NGƯỜI CHƠI ===
${answer.trim()}
==================================

QUY TẮC ĐÁNH GIÁ TỔNG QUÁT (KHÔNG THIÊN VỊ, ÁP DỤNG CHO MỌI VỤ ÁN):
1. ĐỊNH NGHĨA "CĂN CỨ / CHỨNG CỨ HỢP LÝ":
   - Căn cứ chứng minh được chấp nhận khi người chơi dẫn xuất được ít nhất một trong các yếu tố có trong BỐI CẢNH:
     + Nhân chứng / Nguồn tin làm chứng (VD: "theo lời ai đó", "do ai đó nhắc đến/kể lại").
     + Tài liệu / Hiện vật / Tang vật (VD: "trong sổ sách", "trên bảng tin", "theo tin nhắn").
     + Hoàn cảnh / Nguyên nhân / Địa điểm cụ thể (VD: "bị tai nạn ở đâu", "tại thời điểm nào").
   - Cho phép gọi tắt danh xưng, tên riêng quen thuộc hoặc lỗi chính tả nhỏ.

2. TRƯỜNG HỢP ĐẠT (isCorrect = true):
   - Người chơi nêu được KẾT LUẬN kèm theo ít nhất một CĂN CỨ / NGUỒN TIN / HOÀN CẢNH hợp lý khớp với bối cảnh đã cung cấp.
   - Điểm confidenceScore từ 80 đến 100.
   - Phản hồi: Xác nhận kết luận chính xác và có viện dẫn căn cứ chứng minh.

3. TRƯỜNG HỢP KHÔNG ĐẠT (isCorrect = false):
   - Người chơi chỉ nêu kết luận khơi khơi, võ đoán, nói chung chung mù mờ mà HOÀN TOÀN KHÔNG có căn cứ, không có nhân chứng, không có nguồn tin hay hoàn cảnh nào.
   - Điểm confidenceScore từ 0 đến 20.
   - TUYỆT ĐỐI CẤM khen người chơi "đã xác định đúng một phần" hay "đúng đối tượng". Bắt buộc phản hồi thẳng là nhận định vô căn cứ do thiếu chứng cứ/nguồn tin chứng minh.

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

    const parsed = JSON.parse(textOutput)

    return NextResponse.json({
      isCorrect: !!parsed.isCorrect,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0,
      feedback: parsed.feedback || ''
    })
  } catch (error) {
    console.error('Error scanning answer:', error)
    return NextResponse.json(
      { isCorrect: false, feedback: 'Lỗi xử lý server nội bộ.' },
      { status: 500 }
    )
  }
}
