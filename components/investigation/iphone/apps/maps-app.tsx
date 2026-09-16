'use client'

import { useState } from 'react'
import {
  MapPin,
  Navigation,
  Search,
  Compass,
  Layers,
  Info,
  Clock,
  Car,
  Footprints,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function MapsApp() {
  const [selectedPin, setSelectedPin] = useState<any | null>(null)

  const locations = [
    {
      id: 'loc-01',
      title: 'Số 14 Đường Bờ Sông (Hiện trường)',
      desc: 'Nhà riêng nạn nhân Khang. Nằm sát vách rào chắn đường sắt Bắc Nam (khoảng cách 30m).',
      distance: '0 m (Vị trí hiện tại)',
      timeCar: '0 phút',
      type: 'crime_scene',
      geoNote: '🔊 Điểm duy nhất thu được tiếng còi tàu diesel và chuông rào chắn rõ nét!'
    },
    {
      id: 'loc-02',
      title: 'Phòng trọ Trần Thị Hà (Số 8 Ngõ 12)',
      desc: 'Nằm sâu trong khu tập thể ngõ 12. Cách đường sắt 1.2km, bị chắn bởi nhiều dãy nhà 5 tầng.',
      distance: '1.2 km',
      timeCar: '4 phút đi xe máy',
      type: 'suspect',
      geoNote: '❌ Tuyệt đối không thể lọt tiếng còi tàu to vào mic điện thoại khi ở đây.'
    },
    {
      id: 'loc-03',
      title: 'Quán Bia Phố Cổ (Hội Bạn Nhậu)',
      desc: 'Địa điểm nhóm bạn nhậu tụ tập từ 20:00 đến 23:00 tối 24/07.',
      distance: '2.8 km',
      timeCar: '8 phút',
      type: 'poi',
      geoNote: 'Nhóm bạn xác nhận Khang từ chối ra vì uống trà ngấm thuốc mệt mỏi.'
    },
    {
      id: 'loc-04',
      title: 'Bến xe khách Hoàng Long (Tuyến HP)',
      desc: 'Nơi Tùng xuất bến xe khách đi Hải Phòng lúc 19:30 ngày 24/07.',
      distance: '4.5 km',
      timeCar: '15 phút',
      type: 'poi',
      geoNote: 'Chứng cứ ngoại phạm loại trừ Tùng khỏi khung giờ tử vong 21:00.'
    }
  ]

  return (
    <div className="flex flex-col h-full bg-[#1C1C1E] text-white select-none overflow-hidden font-sans relative">
      {/* Top Search Bar */}
      <div className="absolute top-2 left-3 right-3 z-20">
        <div className="h-9 rounded-xl bg-[#2C2C2E]/90 backdrop-blur-md border border-white/10 px-3 flex items-center justify-between text-[#8E8E93] shadow-lg">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-[#8E8E93]" />
            <span className="text-[12px] text-white font-medium">Bản đồ điều tra địa bàn</span>
          </div>
          <Compass className="size-4 text-[#0A84FF]" />
        </div>
      </div>

      {/* Interactive Map Visual Area */}
      <div className="flex-1 bg-[#10141C] relative overflow-hidden flex items-center justify-center p-4">
        {/* Stylized Grid & Map Roads */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0A84FF_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Road & River lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <path d="M 30,300 Q 150,200 300,100" stroke="#0A84FF" strokeWidth="6" fill="none" />
          <path d="M 0,200 L 340,250" stroke="#8E8E93" strokeWidth="2" strokeDasharray="4 4" fill="none" />
          <path d="M 120,0 L 140,400" stroke="#636366" strokeWidth="3" fill="none" />
        </svg>

        {/* Train Track Line label */}
        <div className="absolute top-[215px] left-4 text-[8.5px] font-mono text-[#8E8E93] bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
          🚂 Tuyến đường sắt Bắc Nam
        </div>

        {/* Pin 1: Nhà Khang */}
        <button
          onClick={() => setSelectedPin(locations[0])}
          className="absolute top-[180px] left-[130px] flex flex-col items-center group active:scale-95 transition-transform"
        >
          <div className="size-8 rounded-full bg-[#FF453A] text-white flex items-center justify-center shadow-lg ring-4 ring-[#FF453A]/30 animate-bounce">
            <MapPin className="size-4 fill-white" />
          </div>
          <span className="text-[9px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded mt-1 shadow border border-white/10 whitespace-nowrap">
            Số 14 Bờ Sông (Hiện trường)
          </span>
        </button>

        {/* Pin 2: Phòng trọ Hà */}
        <button
          onClick={() => setSelectedPin(locations[1])}
          className="absolute top-[80px] right-[40px] flex flex-col items-center group active:scale-95 transition-transform"
        >
          <div className="size-7 rounded-full bg-[#FF9F0A] text-white flex items-center justify-center shadow-lg ring-2 ring-white/20">
            <MapPin className="size-3.5 fill-white" />
          </div>
          <span className="text-[8.5px] font-medium bg-black/80 text-[#FF9F0A] px-1.5 py-0.5 rounded mt-1 whitespace-nowrap border border-white/10">
            Trọ Hà (1.2km)
          </span>
        </button>

        {/* Pin 3: Quán bia */}
        <button
          onClick={() => setSelectedPin(locations[2])}
          className="absolute bottom-[110px] left-[40px] flex flex-col items-center group active:scale-95 transition-transform"
        >
          <div className="size-6 rounded-full bg-[#30D158] text-white flex items-center justify-center shadow">
            <MapPin className="size-3 fill-white" />
          </div>
          <span className="text-[8px] font-medium bg-black/80 text-white/90 px-1 rounded mt-0.5 whitespace-nowrap">
            Quán Bia Phố Cổ
          </span>
        </button>
      </div>

      {/* Bottom Sheet Card */}
      <div className="bg-[#1C1C1E] border-t border-[#2C2C2E] p-3.5 z-20 space-y-2 shrink-0">
        {selectedPin ? (
          <div className="space-y-2 animate-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-[13px] font-bold text-white leading-tight">{selectedPin.title}</h4>
                <p className="text-[10.5px] text-[#8E8E93] mt-0.5">{selectedPin.desc}</p>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-[11px] text-[#0A84FF] font-medium"
              >
                Đóng
              </button>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono text-[#D1D1D6] pt-1">
              <span className="flex items-center gap-1 bg-[#2C2C2E] px-2 py-0.5 rounded">
                <Footprints className="size-3 text-[#0A84FF]" /> {selectedPin.distance}
              </span>
              <span className="flex items-center gap-1 bg-[#2C2C2E] px-2 py-0.5 rounded">
                <Car className="size-3 text-[#30D158]" /> {selectedPin.timeCar}
              </span>
            </div>

            <div className="p-2 rounded bg-[#0A84FF]/10 border border-[#0A84FF]/30 text-[10.5px] text-[#0A84FF] leading-snug flex items-start gap-1.5">
              <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
              <span>{selectedPin.geoNote}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Địa điểm liên quan vụ án (Chạm để xem)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {locations.slice(0, 2).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedPin(loc)}
                  className="p-2 rounded-lg bg-[#2C2C2E] hover:bg-[#3A3A3C] text-left transition-colors"
                >
                  <div className="text-[11px] font-semibold text-white truncate">{loc.title}</div>
                  <div className="text-[9px] text-[#8E8E93] mt-0.5">{loc.distance}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
