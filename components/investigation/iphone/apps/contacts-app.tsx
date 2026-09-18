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
  UserPlus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactsAppProps {
  onBackToHome?: () => void
}

export function ContactsApp({ onBackToHome }: ContactsAppProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<any | null>(null)

  const contacts = [
    {
      id: 'c-01',
      name: 'Anh Dũng Cầu Cảng',
      phone: '0903.445.112',
      relationship: 'Anh em bến bãi',
      note: 'Mối bốc vác hàng hóa khu cảng sông.',
      address: 'Phố Cầu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-02',
      name: 'Anh Hùng Sửa Nước',
      phone: '0988.665.123',
      relationship: 'Thợ điện nước',
      note: 'Thợ sửa ống nước dân dụng quanh xóm.',
      address: 'Ngõ 14 Đường Bờ Sông, TP. Hà Nội',
      avatarColor: 'from-[#636366] to-[#48484A]'
    },
    {
      id: 'c-03',
      name: 'Bác Bảy',
      phone: '0908.441.229',
      relationship: 'Hàng xóm Bờ Sông',
      note: 'Hàng xóm lớn tuổi gần nhà.',
      address: 'Số 10 Đường Bờ Sông, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-04',
      name: 'Bà Hai',
      phone: '0913.552.771',
      relationship: 'Hàng xóm xóm Cảng',
      note: 'Bà con lối xóm.',
      address: 'Xóm Cảng, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-05',
      name: 'Bảo Xăm Hình',
      phone: '0934.112.887',
      relationship: 'Tiệm Tattoo',
      note: 'Tiệm xăm hình nghệ thuật.',
      address: 'Phố Vọng, TP. Hà Nội',
      avatarColor: 'from-[#5856D6] to-[#AF52DE]'
    },
    {
      id: 'c-06',
      name: 'Bé My',
      phone: '0971.223.445',
      relationship: 'Bạn bè xã hội',
      note: 'Bạn quen ngoài quán nước.',
      address: 'TP. Hà Nội',
      avatarColor: 'from-[#FF2D55] to-[#FF375F]'
    },
    {
      id: 'c-07',
      name: 'Bình Còi Ba Gác',
      phone: '0915.223.789',
      relationship: 'Lái xe ba gác / Thu nợ',
      note: 'Chạy xe ba gác chở đồ, hay đi cùng đợt đòi nợ họ.',
      address: 'Phường Phân khu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#0A84FF] to-[#5856D6]'
    },
    {
      id: 'c-08',
      name: 'Chị Hạnh Giặt Là',
      phone: '0914.556.789',
      relationship: 'Tiệm giặt là Khâm Thiên',
      note: 'Tiệm giặt khô là hơi, đang gửi áo da với chăn bông.',
      address: 'Số 42 Phố Khâm Thiên, Quận Sông Hồng',
      avatarColor: 'from-[#AF52DE] to-[#5856D6]'
    },
    {
      id: 'c-09',
      name: 'Chị Lan Quán Nước',
      phone: '0932.889.102',
      relationship: 'Hàng xóm đầu ngõ 14',
      note: 'Quán nước chè đầu ngõ 14 Bờ Sông.',
      address: 'Đầu ngõ 14 Đường Bờ Sông, TP. Hà Nội',
      avatarColor: 'from-[#30D158] to-[#0A84FF]'
    },
    {
      id: 'c-10',
      name: 'Chú Sáu Xe Ôm',
      phone: '0913.667.228',
      relationship: 'Tài xế xe ôm',
      note: 'Chạy xe ôm quen ở đầu ngã tư Cầu Cảng.',
      address: 'Ngã tư Cầu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-11',
      name: 'Cô Mai Thuốc Tây',
      phone: '0962.771.889',
      relationship: 'Hiệu thuốc dân sinh',
      note: 'Nhà thuốc tân dược gần chợ.',
      address: 'Chợ Cầu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#30D158] to-[#34C759]'
    },
    {
      id: 'c-12',
      name: 'Cô Sáu',
      phone: '0972.334.881',
      relationship: 'Người quen xóm',
      note: 'Bà con trong phường.',
      address: 'Phường Phân khu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-13',
      name: 'Cơm Chị Ba',
      phone: '0908.334.991',
      relationship: 'Quán cơm bình dân',
      note: 'Quán cơm hay gọi ship cơm trưa sang nhà.',
      address: 'Số 18 Phố Cầu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#FF9500] to-[#FFD60A]'
    },
    {
      id: 'c-14',
      name: 'Cường Mũi Két',
      phone: '0973.665.412',
      relationship: 'Bạn xã hội',
      note: 'Anh em quen ngoài bến xe.',
      address: 'Bến xe Hoàng Long, TP. Hà Nội',
      avatarColor: 'from-[#636366] to-[#48484A]'
    },
    {
      id: 'c-15',
      name: 'Dũng Lò Mổ',
      phone: '0904.778.221',
      relationship: 'Giao thịt tươi',
      note: 'Mối cung cấp thịt lợn thịt bò.',
      address: 'Chợ Cầu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#FF453A] to-[#FF9F0A]'
    },
    {
      id: 'c-16',
      name: 'Duy Bida 88',
      phone: '0916.334.556',
      relationship: 'Chủ bàn Bida',
      note: 'CLB Billiards X-Club, hay đánh độ bida lỗ.',
      address: 'Số 29 Phố Vọng, TP. Hà Nội',
      avatarColor: 'from-[#0A84FF] to-[#64D2FF]'
    },
    {
      id: 'c-17',
      name: 'Đức Cầm Đồ',
      phone: '0909.882.114',
      relationship: 'Hiệu cầm đồ',
      note: 'Nhận cắm giấy tờ xe, điện thoại, máy tính.',
      address: 'Đường Chiến Thắng, TP. Hà Nội',
      avatarColor: 'from-[#FF9F0A] to-[#FF453A]'
    },
    {
      id: 'c-18',
      name: 'Giang Bến Xe',
      phone: '0938.221.776',
      relationship: 'Phụ xe khách',
      note: 'Chạy tuyến xe khách Hải Phòng - Hà Nội.',
      address: 'Bến xe khách Hoàng Long, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-19',
      name: 'Hà',
      phone: '0984.112.568',
      relationship: 'Bạn gái / Thợ may',
      note: 'Bạn gái cũ, thợ may đồ tại phòng trọ Bờ Kè. Tự ý nấu nướng mang sang, kiểm soát khó chịu.',
      address: 'Số 8 Ngõ 12 Đường Bờ Kè, Phường Phân khu Cảng',
      avatarColor: 'from-[#FF2D55] to-[#AF52DE]'
    },
    {
      id: 'c-20',
      name: 'Hải Lác Bến Phà',
      phone: '0918.776.543',
      relationship: 'Con nợ bến phà',
      note: 'Nợ 75 triệu tiền bốc họ, đang trốn không chịu trả.',
      address: 'Khu vực Bến phà Sông Hồng, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-21',
      name: 'Hoàng Cắt Tóc',
      phone: '0948.332.115',
      relationship: 'Tiệm tóc nam',
      note: 'Cắt tóc gội đầu gần ngã ba.',
      address: 'Phố Cầu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-22',
      name: 'Hùng Đen Cửu Vạn',
      phone: '0936.445.882',
      relationship: 'Cửu vạn bến sông',
      note: 'Đội bốc xếp hàng hóa kho bãi.',
      address: 'Đường Ven Cảng, TP. Hà Nội',
      avatarColor: 'from-[#636366] to-[#48484A]'
    },
    {
      id: 'c-23',
      name: 'Khánh Rồng',
      phone: '0905.112.334',
      relationship: 'Bạn xã hội',
      note: 'Quen biết giới cầm đồ cho vay.',
      address: 'TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-24',
      name: 'Linh Nail',
      phone: '0975.667.889',
      relationship: 'Tiệm làm móng',
      note: 'Tiệm làm nail gần chợ.',
      address: 'Chợ Cầu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#FF375F] to-[#FF9F0A]'
    },
    {
      id: 'c-25',
      name: 'Long Sẹo',
      phone: '0979.441.223',
      relationship: 'Đàn em thu họ',
      note: 'Đàn em chuyên đi dán thông báo nợ và lùng bắt xe con nợ.',
      address: 'Xóm Cảng, TP. Hà Nội',
      avatarColor: 'from-[#636366] to-[#3A3A3C]'
    },
    {
      id: 'c-26',
      name: 'Minh Béo',
      phone: '0917.443.221',
      relationship: 'Bạn nhậu',
      note: 'Hay nhậu đêm.',
      address: 'TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-27',
      name: 'Nam Thợ Nề',
      phone: '0906.887.332',
      relationship: 'Cai thầu xây dựng',
      note: 'Thợ xây công trình nhỏ quanh khu.',
      address: 'Phường Phân khu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-28',
      name: 'Ngọc Mai',
      phone: '0912.456.789',
      relationship: 'Em họ (Vợ Lê Quang Vũ)',
      note: 'Em họ con chú, đang đòi chia suất đất đền bù di chúc nhà 14 Bờ Sông.',
      address: 'Số 45 Đường Đoàn Kết, Phường Cảng Đông',
      avatarColor: 'from-[#30D158] to-[#0A84FF]'
    },
    {
      id: 'c-29',
      name: 'Phương Đồ Gỗ',
      phone: '0933.556.112',
      relationship: 'Xưởng mộc đồ gỗ',
      note: 'Xưởng mộc gia công bàn ghế tủ kệ.',
      address: 'Đường Ven Đê, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-30',
      name: 'Quân Lô Đề',
      phone: '0982.441.667',
      relationship: 'Chủ bảng đề',
      note: 'Ghi bảng lô đề, thanh toán qua tài khoản Vietcombank.',
      address: 'Ngõ 45 Đường Đoàn Kết, TP. Hà Nội',
      avatarColor: 'from-[#30D158] to-[#0A84FF]'
    },
    {
      id: 'c-31',
      name: 'Thảo Vy',
      phone: '0978.552.109',
      relationship: 'Người tình / Khách nợ',
      note: 'Người tình trẻ, đã hẹn gom tiền cùng bay trốn vào Sài Gòn sáng 25/7.',
      address: 'Phường Phân khu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#FF9500] to-[#FF2D55]'
    },
    {
      id: 'c-32',
      name: 'Thắng Sửa Xe',
      phone: '0977.112.445',
      relationship: 'Tiệm sửa xe máy',
      note: 'Sửa xe SH, thay dầu và làm lại côn nồi phanh.',
      address: 'Đường Chiến Thắng, TP. Hà Nội',
      avatarColor: 'from-[#636366] to-[#48484A]'
    },
    {
      id: 'c-33',
      name: 'Thím Tư',
      phone: '0964.881.332',
      relationship: 'Họ hàng ở quê',
      note: 'Thím ở quê hay gửi quà cáp chuối ngự lên.',
      address: 'Hà Nam',
      avatarColor: 'from-[#AF52DE] to-[#5856D6]'
    },
    {
      id: 'c-34',
      name: 'Tiến Bến Cảng',
      phone: '0919.223.554',
      relationship: 'Anh em xã hội',
      note: 'Khu vực bến tàu.',
      address: 'Cảng Sông Hồng, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-35',
      name: 'Tuấn Béo Xưởng Mộc',
      phone: '0902.998.114',
      relationship: 'Xưởng gỗ mộc',
      note: 'Thợ đóng đồ mộc dân dụng.',
      address: 'Phố Cầu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-36',
      name: 'Tuấn Bia 88',
      phone: '0945.888.188',
      relationship: 'Chủ Quán Bia 88',
      note: 'Chủ Quán Bia 88 đường Vĩnh Hà, hay rủ xem đá bóng uống bia.',
      address: 'Số 88 Đường Vĩnh Hà, Phường Cảng Đông',
      avatarColor: 'from-[#FFD60A] to-[#FF9500]'
    },
    {
      id: 'c-37',
      name: 'Vinh Quán Nhậu',
      phone: '0907.334.221',
      relationship: 'Chủ quán nhậu',
      note: 'Quán nhậu đêm đồ nướng lẩu.',
      address: 'Phố Vọng, TP. Hà Nội',
      avatarColor: 'from-[#8E8E93] to-[#636366]'
    },
    {
      id: 'c-38',
      name: 'Vũ',
      phone: '0967.452.183',
      relationship: 'Cán bộ địa chính (Em rể họ)',
      note: 'Chồng con Mai, đang nợ 300 triệu tiền bốc họ. Đang ép vẽ khống trích đo lên 120m2.',
      address: 'Số 45 Đường Đoàn Kết, Phường Cảng Đông',
      avatarColor: 'from-[#0A84FF] to-[#5856D6]'
    },
    {
      id: 'c-39',
      name: 'Yến Bún Đậu',
      phone: '0985.221.998',
      relationship: 'Quán ăn sáng',
      note: 'Quán bún đậu mắm tôm gần cổng chợ.',
      address: 'Chợ Cầu Cảng, TP. Hà Nội',
      avatarColor: 'from-[#FF9F0A] to-[#30D158]'
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
            {/* Main Contacts List */}
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
                        <div className="text-[10px] text-[#8E8E93] truncate">{contact.relationship}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

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
