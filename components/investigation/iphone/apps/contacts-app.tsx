'use client'

import { useState } from 'react'
import {
  Users,
  Search,
  Phone,
  MessageSquare,
  Video,
  Mail,
  ArrowLeft,
  Star,
  UserPlus
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ContactsApp() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<any | null>(null)

  const contacts = [
    {
      id: 'c-01',
      name: 'Trần Thị Hà',
      phone: '0912.481.xxx',
      relationship: 'Bạn gái / Thợ may',
      note: 'Rất hay ghen, giám sát từng li từng tí. Tự ý mang trà với đồ ăn sang.',
      address: 'Số 8 Ngõ 12 Đường Bờ Sông',
      avatarColor: 'from-[#FF2D55] to-[#AF52DE]'
    },
    {
      id: 'c-02',
      name: 'Yến Nhi',
      phone: '0978.552.xxx',
      relationship: 'Người yêu mới ❤️',
      note: 'Hẹn đi du lịch Đà Lạt 25/7, đã chuyển cọc tour 12 triệu.',
      address: 'Phố Huế, Hai Bà Trưng',
      avatarColor: 'from-[#FF9500] to-[#FF2D55]'
    },
    {
      id: 'c-03',
      name: 'Lê Quang Vũ',
      phone: '0903.114.xxx',
      relationship: 'Cán bộ đo đạc địa chính',
      note: 'Còn nợ 350 triệu tiền bốc họ. Đang ép vẽ khống trích đo lên 120m2.',
      address: 'Tập thể Địa chính Hà Nội',
      avatarColor: 'from-[#0A84FF] to-[#5856D6]'
    },
    {
      id: 'c-04',
      name: 'Trần Ngọc Mai (Em họ)',
      phone: '0984.661.xxx',
      relationship: 'Em họ con chú',
      note: 'Nhăm nhe đòi chia tiền đền bù căn nhà số 14. Đang nghi ngờ di chúc bị sửa.',
      address: 'Ngõ 20 Tây Sơn, Đống Đa',
      avatarColor: 'from-[#30D158] to-[#0A84FF]'
    },
    {
      id: 'c-05',
      name: 'Nguyễn Thanh Tùng',
      phone: '0919.332.xxx',
      relationship: 'Bạn nối khố thuở nhỏ',
      note: 'Vừa về Hà Nội giải quyết việc riêng, hẹn chia tay đi Hải Phòng tối 24/7.',
      address: 'Quê gốc Đường Bờ Sông',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-06',
      name: 'Tuấn "Bia"',
      phone: '0936.888.xxx',
      relationship: 'Hội bạn nhậu',
      note: 'Chủ quán bia phố cổ, hay gọi đi giao lưu.',
      address: 'Phố Cổ, Hoàn Kiếm',
      avatarColor: 'from-[#FFD60A] to-[#FF9500]'
    }
  ]

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  )

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none overflow-hidden font-sans">
      {selectedContact ? (
        /* CONTACT DETAIL CARD */
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between px-3 pt-2 pb-2 bg-[#161618] border-b border-[#2C2C2E] shrink-0">
            <button
              onClick={() => setSelectedContact(null)}
              className="flex items-center gap-0.5 text-[#0A84FF] text-[13px] font-medium active:opacity-60"
            >
              <ArrowLeft className="size-4" />
              <span>Danh bạ</span>
            </button>
            <span className="text-[12px] font-medium text-[#0A84FF]">Sửa</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-12">
            {/* Big Avatar & Name */}
            <div className="flex flex-col items-center pt-2 space-y-1">
              <div
                className={cn(
                  'size-16 rounded-full bg-gradient-to-tr text-white flex items-center justify-center text-xl font-bold shadow-lg border border-white/20',
                  selectedContact.avatarColor
                )}
              >
                {selectedContact.name.slice(0, 1)}
              </div>
              <h2 className="text-[17px] font-bold text-white text-center mt-2">
                {selectedContact.name}
              </h2>
              <span className="text-[11px] text-[#8E8E93]">{selectedContact.relationship}</span>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] flex flex-col items-center gap-1 text-[#0A84FF]">
                <MessageSquare className="size-4 fill-current" />
                <span className="text-[9px] text-[#8E8E93]">Nhắn tin</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] flex flex-col items-center gap-1 text-[#0A84FF]">
                <Phone className="size-4 fill-current" />
                <span className="text-[9px] text-[#8E8E93]">Gọi</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] flex flex-col items-center gap-1 text-[#0A84FF]">
                <Video className="size-4 fill-current" />
                <span className="text-[9px] text-[#8E8E93]">FaceTime</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] flex flex-col items-center gap-1 text-[#0A84FF]">
                <Mail className="size-4" />
                <span className="text-[9px] text-[#8E8E93]">Mail</span>
              </div>
            </div>

            {/* Details Box */}
            <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] space-y-3 text-[12px]">
              <div>
                <div className="text-[10px] text-[#8E8E93]">Số điện thoại</div>
                <div className="text-[14px] font-mono text-[#0A84FF] font-semibold mt-0.5">
                  {selectedContact.phone}
                </div>
              </div>
              <div className="border-t border-[#2C2C2E] pt-2">
                <div className="text-[10px] text-[#8E8E93]">Địa chỉ</div>
                <div className="text-white mt-0.5">{selectedContact.address}</div>
              </div>
              <div className="border-t border-[#2C2C2E] pt-2">
                <div className="text-[10px] text-[#FFD60A] font-semibold">Ghi chú cá nhân của Khang:</div>
                <div className="text-[#D1D1D6] mt-0.5 italic leading-relaxed">
                  "{selectedContact.note}"
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CONTACTS LIST VIEW */
        <div className="flex flex-col h-full">
          <div className="px-4 pt-3 pb-2 bg-[#000000] shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[20px] font-bold tracking-tight text-white">Danh bạ</span>
              <UserPlus className="size-4 text-[#0A84FF]" />
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#8E8E93]" />
              <input
                type="text"
                placeholder="Tìm kiếm danh bạ"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-7 rounded-lg bg-[#1C1C1E] pl-8 pr-3 text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-[#0A84FF]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-10 divide-y divide-[#1C1C1E]">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="py-2.5 px-2 flex items-center gap-3 hover:bg-[#1C1C1E]/50 active:bg-[#2C2C2E]/60 rounded-xl cursor-pointer transition-colors"
              >
                <div
                  className={cn(
                    'size-9 rounded-full bg-gradient-to-tr text-white flex items-center justify-center font-bold text-xs shadow border border-white/10 shrink-0',
                    contact.avatarColor
                  )}
                >
                  {contact.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white truncate">
                    {contact.name}
                  </div>
                  <div className="text-[10px] text-[#8E8E93] truncate">{contact.relationship}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
