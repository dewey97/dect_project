'use client'

import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { TypewriterNarrator } from './evidence/typewriter-narrator'
import { detectiveAudio } from '@/lib/investigation-audio'
import { cn } from '@/lib/utils'

interface EpilogueModalProps {
  isOpen: boolean
  onClose?: () => void
}

const EPILOGUE_STORIES = [
  {
    id: 'tron-tim',
    title: 'Trò chơi trốn tìm',
    monologue: `Chiều nay em lại được đi chơi cùng anh chị, vui quá đi. Hôm nay anh chị sẽ đưa em đi chơi trốn tìm. Hì hì may quá lần này em được đi trốn chứ không cần đi tìm.

Nhưng mà lạ quá, anh Khang bình thường hay bắt nạt em vì em không nói được, thế mà nay anh lại chủ động cầm tay em:

"Đây để anh đưa em đi trốn chỗ này, đảm bảo không ai tìm thấy"

Em vâng lời để anh Khang dẫn đi. Anh dẫn em đến trước một chiếc tủ gỗ cạnh bờ sông, trông nó cũ lắm rồi.

"Em cứ vào đây trốn, chắc chắn không ai tìm được đâu. Đưa còi đây anh cầm, nếu có ai đến gần tủ, anh sẽ thổi còi đánh lạc hướng cho. Đảm bảo em thắng trò này nhé"

Thế thì tốt quá! Em cũng muốn thắng lắm, để mọi người không coi em là đồ yếu đuối chỉ biết dựa dẫm vào anh trai em nữa. Em vội chui vào tủ luôn. Sắp hết thời gian rồi...

Nhưng sao lâu thế mà vẫn không thấy ai đến tìm em?
Có khi nào chiếc tủ này ở xa quá nên mọi người quên mất nó không?
Hay là anh chị vẫn đang tìm những người khác nhỉ?

Lâu quá... lâu quá rồi. Em bắt đầu thấy thật khó thở. Em lấy tay gõ liên tục vào cánh tủ.
Có ai không... Có ai ở gần đây không... Mở cửa cho em ra với...

Tự nhiên ngực em đau nhói. Hình như em lại phát bệnh tim rồi. Thuốc... Thuốc của em…
Còi... Chiếc còi của em đâu rồi... .

Em không cần thắng trò chơi này nữa đâu...
Anh Tùng ơi...Sao anh vẫn chưa đến tìm em....`
  },
  {
    id: 'ha',
    title: 'Bi kịch tình yêu',
    monologue: `Sau khi cảnh sát đưa ra những bằng chứng không thể chối cãi, Hà đã nhận tội.

Đêm hôm đó, Hà đã rình rập ngoài nhà Khang vì cô biết anh ta đang lén lút với ả nhân tình nào đó. Hà muốn phải bắt tận tay để Khang hết đường chối cãi. Nhưng khi vô tình thấy Tùng hốt hoảng chạy ra từ nhà Khang, Hà định vào hỏi có chuyện gì thì thấy Khang đã nằm gục trên sàn nhà.

Sợ có chuyện không hay, Hà có lại gần để kiểm tra tình hình của Khang. Đúng lúc đó, tin nhắn của ả nhân tình gửi đến, Hà mới biết Khang đã lên kế hoạch bỏ rơi mình để bắt đầu cuộc sống mới với người đàn bà khác. Trong cơn phẫn hận, Hà đã vơ ngay mảnh sứ đâm vào cổ Khang.

"Chính tôi là người đã ở bên anh Khang bao nhiêu năm qua, chịu đựng mọi điều phỉ nhổ khi qua lại với một kẻ giang hồ. Nếu không có tôi, còn ai chấp nhận một người như thế. Tôi cứ tưởng rằng chỉ cần mình hy sinh tất thảy, anh ta sẽ thay đổi bản tính để tu chí làm ăn, xây dựng gia đình. Thanh xuân của tôi đã trao hết cho thằng khốn đó, làm sao tôi có thể giương mắt nhìn anh ta lấy đi tất cả để ở bên một người khác."

Tại phiên tòa xét xử, Hà bình thản nghe tuyên án. Khi được nói lời cuối cùng, Hà không xin giảm án, không tỏ ra hối hận mà chỉ mỉm cười nói: "Em không hối hận. Nếu em không giữ được anh, thì không ai trên đời này được phép có anh."

Nhưng chỉ vài ngày sau, Hà phát hiện mình có những dấu hiệu bất thường.
Cô đã có thai hai tháng, đứa con là của Khang.

Từ ngày biết mình mang cốt nhục của người đàn ông do chính tay mình giết chết, Hà trở nên điên loạn. Lúc thì cô gào khóc than trách ông trời vì sao lại sắp đặt 1 bi kịch nghiệt ngã đến vậy, lúc lại tủm tỉm vuốt ve bụng và thì thầm như thể đang kể Khang nghe về đứa con của hai người.

Vì tinh thần người mẹ không ổn định, trại giam liên hệ với nhân thân còn sót lại của Khang - Mai và Vũ, đề nghị họ nhận nuôi đứa trẻ. Nhưng ám ảnh về cái chết của Khang, Mai và Vũ từ chối. Họ đề nghị gửi đứa bé cho Trung tâm bảo trợ xã hội, nếu cần hai vợ chồng sẽ chu cấp thêm chi phí nuôi dưỡng.

Ngay khi tất cả đều nghĩ rằng đứa trẻ sẽ không còn nơi nương tựa, trại giam bất ngờ nhận được đề nghị nhận nuôi từ một người đàn ông.
Anh ta gửi thư đến Hà, chỉ có vài dòng ngắn gọn.

"Hãy để tôi được chuộc lại tội lỗi của mình. Nếu không vì hành động đêm đó đã đẩy Khang đến nguy hiểm, thì đứa bé đã không phải rơi vào cảnh mồ côi. Mọi ân oán lẽ ra nên để lại trong quá khứ. Vì mọi sinh linh bé nhỏ đều là vô tội, 20 năm trước hay bây giờ cũng như vậy"

Cầm bức thư trên tay, ánh mắt điên dại của Hà chợt khựng lại. Lần đầu tiên, Hà thấy mình tỉnh táo đến vậy. Quá khứ như thước phim hiện lên trong tâm trí Hà. Có lẽ những ngày đầu tiên, cô đã thật lòng yêu thương Khang và anh ta cũng vậy. Thế mà bao cám dỗ và vòng xoáy của cuộc đời đã đẩy cả hai đến bước đường cùng không thể quay đầu lại.

Nhưng ngày tháng vẫn còn ở phía trước, và đứa trẻ xứng đáng thuộc về một tương lai tươi sáng, không còn hận thù bủa vây.`
  },
  {
    id: 'vu',
    title: 'Sai lầm của Vũ',
    monologue: `Vũ là người chồng sĩ diện nhưng bất lực. Nhìn gia đình nhà vợ (Mai) coi thường, Vũ sa lầy vào bốc họ 350M từ Khang để xoay xở làm ăn rồi dính bẫy lãi mẹ đẻ lãi con.\n\nBị Khang dùng giấy nợ đe dọa ép làm giả bản vẽ đo đạc từ 75m2 lên 120m2 và dọa tung chuyện cho Mai biết, Vũ sống trong sợ hãi tột cùng. Đêm 24/07, Vũ giả vờ cho vợ về trước để lén chui cửa sau tìm giấy nợ tiêu hủy.\n\nVũ không trực tiếp ra tay đâm người, nhưng sự lén lút và gian dối của Vũ đã vô tình đẩy chuỗi sự kiện đêm đó vào kịch bản án mạng đẫm máu.`
  },
  {
    id: 'mai',
    title: 'Di chúc của ông nội',
    monologue: `Mai luôn nghi ngờ Khang cướp di chúc, nhưng khi cầm bản di chúc gốc đến văn phòng luật sư, Mai mới bàng hoàng biết ông nội vốn đã chia đều căn nhà cho cả 2 anh em từ năm 2018.\n\nKhang vì lòng tham đã dùng hóa chất tẩy tên Mai để chiếm trọn khoản tiền đền bù. Sự tham lam của Khang và sự nghi hận của Mai đã phá nát tình anh em ruột thịt.\n\nMai nhận lại mảnh đất đền bù nhưng mất đi người anh họ và đối mặt với người chồng (Vũ) đang vướng vào vòng lao lý vì gian lận đo đạc địa chính.`
  }
]

export function EpilogueModal({ isOpen }: EpilogueModalProps) {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0)

  if (!isOpen) return null

  const currentStory = EPILOGUE_STORIES[activeStoryIdx]

  const handleSelectStory = (idx: number) => {
    detectiveAudio.playTypewriterClick()
    setActiveStoryIdx(idx)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-[#0c0805] text-[#e5d8cb] overflow-hidden flex flex-col font-sans select-none">
        {/* CRT Background scanlines */}
        <div className="noir-scanlines pointer-events-none absolute inset-0 opacity-20 z-10" />

        {/* Top Header / Bar */}
        <header className="relative z-20 shrink-0 px-4 py-2.5 sm:px-6 bg-[#160f0a] border-b border-[#2e2015] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#d9a066]">
            <BookOpen className="size-4 sm:size-4.5" />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase">
              KÝ SỰ HẬU ÁN
            </span>
          </div>
        </header>

        {/* Mobile Horizontal Tabs Selector */}
        <nav className="relative z-20 flex lg:hidden overflow-x-auto custom-scrollbar bg-[#100b07] border-b border-[#22160d] p-1 px-2 gap-1 shrink-0">
          {EPILOGUE_STORIES.map((s, idx) => {
            const isSelected = activeStoryIdx === idx
            return (
              <button
                key={s.id}
                onClick={() => handleSelectStory(idx)}
                className={cn(
                  'px-2.5 py-1 text-[0.72rem] font-mono tracking-tight transition-all shrink-0 cursor-pointer border rounded-none',
                  isSelected
                    ? 'bg-[#24170e] border-[#c49257]/80 text-[#d9a066] font-semibold'
                    : 'bg-transparent border-[#22160d] text-[#7e6d5e] hover:text-[#d9c4b1] hover:bg-[#18100a]'
                )}
              >
                <span>{s.title}</span>
              </button>
            )
          })}
        </nav>

        {/* Main Content Area */}
        <div className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-0">
          
          {/* Left / Main Typewriter Story Canvas */}
          <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[#24180f] p-4 sm:p-6 lg:p-7 flex flex-col justify-start items-center bg-black overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-3 max-w-xl mx-auto w-full flex flex-col items-start py-1">
              {/* Typewriter Story Display */}
              <div className="w-full">
                <TypewriterNarrator key={currentStory.id} text={currentStory.monologue} speed={12} />
              </div>
            </div>
          </div>

          {/* Right Column (Desktop Story Selector) */}
          <div className="hidden lg:flex lg:col-span-4 p-3.5 lg:p-4 bg-[#140e09] flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="flex flex-col space-y-2.5">
              <div className="border-b border-[#291b12] pb-1.5">
                <span className="font-mono text-[0.68rem] text-[#a88a6d] uppercase font-bold tracking-widest">
                  DANH SÁCH HẬU ÁN
                </span>
              </div>

              {/* 4 Story Option Cards */}
              <div className="space-y-1.5">
                {EPILOGUE_STORIES.map((s, idx) => {
                  const isSelected = activeStoryIdx === idx
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectStory(idx)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-xs font-serif transition-all flex items-center justify-between cursor-pointer border rounded-none',
                        isSelected
                          ? 'bg-[#291b11] border-[#c49257]/80 text-[#f5ebd9] font-semibold'
                          : 'bg-[#19110b]/80 border-[#26190f] text-[#8e7b6c] hover:bg-[#20160f] hover:text-[#d9c4b1] hover:border-[#382618]'
                      )}
                    >
                      <span>{s.title}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 bg-[#c49257]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </AnimatePresence>
  )
}
