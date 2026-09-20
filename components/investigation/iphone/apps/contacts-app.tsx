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
  ChevronLeft,
  Star,
  UserPlus,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePhoneData } from '@/lib/hooks/use-phone-data'

interface ContactsAppProps {
  onBackToHome?: () => void
}

export function ContactsApp({ onBackToHome }: ContactsAppProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<any | null>(null)

  const { data: contactsData, loading, error } = usePhoneData('contacts')

  // Map sheet format (contact_id, name, phone_number, category, note) to component structure
  const contacts = contactsData.map((item: any, idx: number) => ({
    id: item.contact_id || `c-${idx + 1}`,
    name: item.name || 'Không tên',
    phone: item.phone_number || '',
    relationship: item.category || 'Người quen',
    note: item.note || '',
    address: 'TP. Hà Nội',
    avatarColor: 'from-[#0A84FF] to-[#5856D6]'
  }))

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
                <div className="text-[10px] text-[#8E8E93]">Phân loại</div>
                <div className="text-white mt-0.5">{selectedContact.relationship}</div>
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
              {onBackToHome ? (
                <button
                  onClick={onBackToHome}
                  className="flex items-center gap-0.5 text-[#0A84FF] text-[12.5px] font-medium hover:opacity-80 active:opacity-60 cursor-pointer"
                  title="Thoát ứng dụng về Màn hình chính"
                >
                  <ChevronLeft className="size-4" />
                  <span>Trang chính</span>
                </button>
              ) : (
                <span className="w-12" />
              )}
              <span className="text-[17px] font-bold tracking-tight text-white">Danh bạ</span>
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

          {/* CONTACTS LIST VIEW WITH A-Z INDEX */}
          <div className="flex-1 overflow-y-auto relative flex pb-10">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-[#8E8E93]">
                <Loader2 className="size-6 animate-spin mb-2 text-[#0A84FF]" />
                <span className="text-xs">Đang tải danh bạ từ Google Sheets...</span>
              </div>
            ) : error ? (
              <div className="flex-1 p-4 text-center text-xs text-red-400">Lỗi: {error}</div>
            ) : (
              /* Main Contacts List */
              <div className="flex-1 px-2 divide-y divide-[#1C1C1E]">
                {filteredContacts.map((contact, idx) => {
                  const firstLetter = contact.name.slice(0, 1).toUpperCase()
                  const prevFirstLetter = idx > 0 ? filteredContacts[idx - 1].name.slice(0, 1).toUpperCase() : null
                  const isNewSection = firstLetter !== prevFirstLetter

                  return (
                    <div key={contact.id}>
                      {isNewSection && (
                        <div className="bg-[#1C1C1E]/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-[#8E8E93] font-mono sticky top-0 z-10 my-1 rounded">
                          {firstLetter}
                        </div>
                      )}
                      <div
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
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* iOS A-Z Alphabet Right Bar */}
            <div className="w-4 py-2 flex flex-col items-center justify-between text-[8px] font-bold text-[#0A84FF] font-mono select-none shrink-0 pr-1 opacity-80">
              {['#', 'A', 'B', 'C', 'D', 'Đ', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'Q', 'T', 'V', 'Y'].map((char) => (
                <span key={char} className="hover:text-white cursor-pointer">{char}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
