'use client'

import { useState } from 'react'

interface TestCaseItem {
  text: string
  reason?: string
}

interface PresetContext {
  id: string
  title: string
  context: string
  validCases: TestCaseItem[]
  invalidCases: TestCaseItem[]
  sampleAnswers: { label: string; text: string }[]
}

const PRESETS: PresetContext[] = [
  {
    id: 'phase_1b_tung',
    title: 'Phase 1B: Thân thế Nguyễn Thanh Tùng & Bi kịch Gia Huy',
    context: `Tùng là anh trai của Gia Huy - cậu bé bị chết 20 năm trước (1996) trong tủ gỗ do Khang gài then cài cửa khi chơi trốn tìm. Mối quan hệ anh em này được nhân chứng là ông Tiến kể lại.`,
    validCases: [
      {
        text: 'Tùng là anh Huy do ông Tiến nhắc đến',
        reason: 'Có quan hệ anh em (Tùng - Huy) + Viện dẫn đúng nhân chứng làm căn cứ (ông Tiến).'
      },
      {
        text: 'Tùng là anh ruột của cậu bé chết ngạt trong tủ gỗ 20 năm trước',
        reason: 'Có quan hệ + Nêu rõ nguyên nhân & hoàn cảnh xảy ra sự việc (chết ngạt trong tủ gỗ).'
      },
      {
        text: 'Gia Huy là em trai Tùng, bị chết trong tủ gỗ vụ trốn tìm 1996 do ông Tiến kể',
        reason: 'Đầy đủ tên nạn nhân, bối cảnh tủ gỗ 1996 và nhân chứng.'
      }
    ],
    invalidCases: [
      {
        text: 'Tùng là anh cậu bé chế hồi trước',
        reason: 'Nói quá chung chung mù mờ, không tên, không nhân chứng, không rõ chết như thế nào.'
      },
      {
        text: 'Tùng với Khang là anh em họ',
        reason: 'Sai lệch hoàn toàn nhân vật và mối quan hệ.'
      },
      {
        text: 'Ông Tiến bảo Tùng là bạn thân của Khang',
        reason: 'Viện dẫn sai lời khai của nhân chứng.'
      }
    ],
    sampleAnswers: [
      {
        label: 'Có nhân chứng (Sẽ ĐẠT)',
        text: 'Tùng là anh Huy do ông Tiến nhắc đến'
      },
      {
        label: 'Nói khơi khơi mù mờ (Bị TRƯỢT)',
        text: 'Tùng là anh cậu bé chế hồi trước'
      },
      {
        label: 'Đầy đủ nguyên nhân & chi tiết (Sẽ ĐẠT)',
        text: 'Tùng là anh trai của Gia Huy, cậu bé chết trong tủ gỗ 20 năm trước theo lời ông Tiến nhắc đến.'
      },
      {
        label: 'Sai dữ kiện (Bị TRƯỢT)',
        text: 'Tùng là anh họ của Khang theo lời bà Lụa'
      }
    ]
  },
  {
    id: 'phase_0',
    title: 'Phase 0: Xác minh 3 Số điện thoại ẩn danh',
    context: `- Nạn nhân là Nguyễn Văn Khang.
- Số 0967.452.183 (và 0988.200.991) nhắn tin xưng "Lệch Pha", đối chiếu Sổ ghi nợ có chữ ký và biệt danh là Lê Quang Vũ (em rể/chồng Mai, nợ 300 triệu).
- Số 0912.331.888 đối chiếu với Bảng tin rao vặt vật liệu xây dựng trước ngõ là Nguyễn Thanh Tùng (thợ nề).
- Số 0984.180.357 đối chiếu với Sổ nợ (nợ 50 triệu) là Đạt Gà Chợ Cảng.`,
    validCases: [
      {
        text: 'Số 0967 là Lê Quang Vũ nợ 300tr trong sổ nợ, 0912 là Tùng thợ nề trên bảng tin, 0984 là Đạt Gà chợ cảng.',
        reason: 'Đủ 3 người kèm căn cứ chứng minh từ sổ nợ và bảng tin.'
      },
      {
        text: '3 người là Vũ nợ tiền trong sổ, Tùng thợ xây và Đạt Gà ở chợ.',
        reason: 'Nói vắn tắt nhưng đủ 3 người và căn cứ nhận diện.'
      }
    ],
    invalidCases: [
      {
        text: '3 số này là của bạn bè nạn nhân thôi',
        reason: 'Không chỉ ra được danh tính cụ thể.'
      },
      {
        text: 'Số 0967 là của Mai vợ Khang',
        reason: 'Sai lệch danh tính nhân vật.'
      }
    ],
    sampleAnswers: [
      {
        label: 'Đúng chuẩn đủ 3 người',
        text: 'Số 0967 là Lê Quang Vũ nợ 300 triệu trong sổ nợ có chữ ký, 0912 là Nguyễn Thanh Tùng làm thợ nề đăng trên bảng tin, còn 0984 là Đạt Gà Chợ Cảng nợ 50 triệu.'
      },
      {
        label: 'Chỉ đoán mò vu vơ',
        text: 'Là mấy người quen biết nạn nhân Khang'
      }
    ]
  },
  {
    id: 'phase_1a',
    title: 'Phase 1A: Ngoại phạm Quán Bia 88 của Lê Quang Vũ',
    context: `- Lê Quang Vũ có nợ Khang 300 triệu và đến nhà Khang lúc 19:00 xin khất nợ.
- Sau khi bị đe dọa, Vũ rời khỏi nhà Khang lúc 19:25 bắt xe ôm ra Quán Bia 88.
- Vũ ngồi uống bia tại Quán Bia 88 từ 19:40 đến 21:15 có sổ chấm bia của chủ quán xác nhận.
- Án mạng xảy ra lúc ~21:00, thời điểm đó Vũ đang ở quán bia nên có bằng chứng ngoại phạm vững chắc, không thể là thủ phạm giết Khang.`,
    validCases: [
      {
        text: 'Vũ không giết người vì lúc 21h anh ta đang uống ở Quán Bia 88, có sổ chấm bia làm chứng.',
        reason: 'Nêu đúng thời điểm xảy ra án và bằng chứng quán bia.'
      }
    ],
    invalidCases: [
      {
        text: 'Vũ tốt bụng lắm không giết người đâu',
        reason: 'Cảm tính, không có bằng chứng ngoại phạm.'
      },
      {
        text: 'Vũ ở nhà Khang suốt từ 19h đến 21h30',
        reason: 'Sai sự thật mốc thời gian.'
      }
    ],
    sampleAnswers: [
      {
        label: 'Ngoại phạm Quán bia 88',
        text: 'Vũ có chứng cứ ngoại phạm vì từ 19:40 đến 21:15 anh ta đang ở Quán Bia 88 có sổ chấm bia chứng minh, trong khi án mạng xảy ra lúc 21h.'
      },
      {
        label: 'Nói cảm tính',
        text: 'Vũ chỉ đến xin nợ chứ không có thù oán gì nên không giết Khang'
      }
    ]
  }
]

interface ScanResult {
  isCorrect: boolean
  confidenceScore: number
  feedback: string
  latencyMs?: number
}

export default function TestAiPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id)
  const [context, setContext] = useState<string>(PRESETS[0].context)
  const [validCasesText, setValidCasesText] = useState<string>(
    PRESETS[0].validCases.map((c) => `- ${c.text}${c.reason ? ` // ${c.reason}` : ''}`).join('\n')
  )
  const [invalidCasesText, setInvalidCasesText] = useState<string>(
    PRESETS[0].invalidCases.map((c) => `- ${c.text}${c.reason ? ` // ${c.reason}` : ''}`).join('\n')
  )
  const [answer, setAnswer] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId)
    const found = PRESETS.find((p) => p.id === presetId)
    if (found) {
      setContext(found.context)
      setValidCasesText(
        found.validCases.map((c) => `- ${c.text}${c.reason ? ` // ${c.reason}` : ''}`).join('\n')
      )
      setInvalidCasesText(
        found.invalidCases.map((c) => `- ${c.text}${c.reason ? ` // ${c.reason}` : ''}`).join('\n')
      )
      setAnswer('')
      setResult(null)
      setErrorMsg('')
    }
  }

  const handleApplySampleAnswer = (text: string) => {
    setAnswer(text)
    setResult(null)
    setErrorMsg('')
  }

  // Parse text formatted line-by-line into TestCaseItem array
  const parseLines = (text: string): TestCaseItem[] => {
    return text
      .split('\n')
      .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
      .filter((line) => line.length > 0)
      .map((line) => {
        const parts = line.split('//')
        return {
          text: parts[0].trim(),
          reason: parts[1] ? parts[1].trim() : undefined
        }
      })
  }

  const handleScan = async () => {
    if (!context.trim() || !answer.trim()) {
      setErrorMsg('Vui lòng nhập cả bối cảnh và câu trả lời!')
      return
    }

    setIsLoading(true)
    setErrorMsg('')
    setResult(null)
    const startTime = performance.now()

    try {
      const validCases = parseLines(validCasesText)
      const invalidCases = parseLines(invalidCasesText)

      const res = await fetch('/api/test-scan-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          answer,
          validCases,
          invalidCases
        })
      })

      const endTime = performance.now()
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.feedback || `Lỗi máy chủ (${res.status})`)
      }

      setResult({
        ...data,
        latencyMs: Math.round(endTime - startTime)
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định'
      setErrorMsg(message)
    } finally {
      setIsLoading(false)
    }
  }

  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId)

  return (
    <div className="min-h-screen bg-[#0e1117] text-[#e6edf3] p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#30363d] pb-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
              FEW-SHOT LABS // AI JUDGE BENCH
            </span>
            <span className="text-xs text-neutral-400 font-mono">Route: /test-ai</span>
          </div>
          <h1 className="text-2xl font-bold mt-2 text-white tracking-wide">
            Kiểm Chứng Đáp Án Bằng Few-Shot In-Context Learning
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Cung cấp Bối cảnh + Các trường hợp ĐẠT & KHÔNG ĐẠT mẫu để AI học chuẩn xác ranh giới chấm điểm mà không cần sửa code.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
          <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            1. Chọn Kịch bản kiểm thử
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  selectedPresetId === preset.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#21262d] text-neutral-300 hover:bg-[#30363d]'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          {/* Context Display */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs text-neutral-400 flex justify-between">
              <span>Bối cảnh sự thật vụ án (Ground Truth Context):</span>
              <span className="text-neutral-500 text-[11px]">(Có thể chỉnh sửa tuỳ ý)</span>
            </label>
            <textarea
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2.5 text-xs font-mono text-neutral-300 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* 2 Cột Ví dụ Mẫu Few-Shot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Cột 1: Mẫu ĐẠT */}
            <div className="space-y-1.5">
              <label className="text-xs text-emerald-400 font-semibold flex items-center justify-between">
                <span>✓ Các câu mẫu ĐẠT (Valid Cases):</span>
                <span className="text-neutral-500 text-[10px] font-normal">Định dạng: - Câu // Lý do đạt</span>
              </label>
              <textarea
                rows={5}
                value={validCasesText}
                onChange={(e) => setValidCasesText(e.target.value)}
                placeholder="- Câu trả lời 1 // Lý do đạt&#10;- Câu trả lời 2 // Lý do đạt"
                className="w-full bg-[#0d1117] border border-emerald-500/30 rounded p-2.5 text-xs font-mono text-emerald-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Cột 2: Mẫu TRƯỢT */}
            <div className="space-y-1.5">
              <label className="text-xs text-rose-400 font-semibold flex items-center justify-between">
                <span>✗ Các câu mẫu BẮT BUỘC TRƯỢT (Invalid Cases):</span>
                <span className="text-neutral-500 text-[10px] font-normal">Định dạng: - Câu // Lý do trượt</span>
              </label>
              <textarea
                rows={5}
                value={invalidCasesText}
                onChange={(e) => setInvalidCasesText(e.target.value)}
                placeholder="- Câu nói vu vơ // Lý do trượt&#10;- Câu sai dữ kiện // Lý do trượt"
                className="w-full bg-[#0d1117] border border-rose-500/30 rounded p-2.5 text-xs font-mono text-rose-200 focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Answer Input */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              2. Nhập câu trả lời của người chơi cần test
            </div>
            {currentPreset && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
                <span className="text-neutral-500 text-[11px]">Thử nhanh:</span>
                {currentPreset.sampleAnswers.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplySampleAnswer(s.text)}
                    className="text-[11px] px-2 py-0.5 bg-[#21262d] hover:bg-[#30363d] text-blue-400 rounded transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Ví dụ: Tùng là anh Huy do ông Tiến nhắc đến..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded p-3 text-sm text-white focus:outline-none focus:border-blue-500 leading-relaxed placeholder:text-neutral-600"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-neutral-500">
              * AI sẽ học ranh giới logic từ các cặp ví dụ trên để phán quyết.
            </div>
            <button
              onClick={handleScan}
              disabled={isLoading || !answer.trim()}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs rounded transition-all flex items-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang đối chiếu Few-Shot...
                </>
              ) : (
                'Quét Đáp Án (Gemini Flash) ➔'
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-red-400 text-xs">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div
            className={`border rounded-lg p-5 space-y-3 transition-all ${
              result.isCorrect
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                    result.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {result.isCorrect ? '✓ ĐẠT (PASS)' : '✗ CHƯA ĐẠT (FAIL)'}
                </span>
                <span className="text-xs text-neutral-400">
                  Điểm tự tin: <strong className="text-white">{result.confidenceScore}%</strong>
                </span>
              </div>
              {result.latencyMs !== undefined && (
                <span className="text-xs font-mono text-neutral-500">
                  Thời gian phản hồi: {result.latencyMs}ms
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-white/5 space-y-1">
              <div className="text-xs font-semibold text-neutral-300">Nhận xét của Giám Khảo AI:</div>
              <p
                className={`text-sm leading-relaxed ${
                  result.isCorrect ? 'text-emerald-200' : 'text-rose-200'
                }`}
              >
                &ldquo;{result.feedback}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
