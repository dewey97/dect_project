/**
 * Master Seed Script: Generates complete, expanded Figma Master Map Vector Dataset
 * Canvas dimensions: 2800 x 2000 (Expanded to cover Noi Bai Highway to Cau Buou & Dong Anh)
 * Saves directly into data/maps/case_000_vector.json (Database layer)
 */

const fs = require('fs')
const path = require('path')

const MAPS_DIR = path.resolve(process.cwd(), 'data/maps')
const OUTPUT_FILE = path.join(MAPS_DIR, 'case_000_vector.json')

const figmaVectorMap = {
  version: '2.0.0',
  caseId: 'case_000',
  canvasWidth: 2800,
  canvasHeight: 2000,
  backgroundColor: '#EEF2F6',
  water: [
    {
      id: 'water-song-hong',
      name: 'Sông Hồng (Red River)',
      type: 'river',
      points: [
        { x: 1720, y: -60 },
        { x: 1780, y: 140 },
        { x: 1870, y: 340 },
        { x: 1980, y: 560 },
        { x: 2060, y: 840 },
        { x: 2160, y: 1140 },
        { x: 2280, y: 1420 },
        { x: 2450, y: 1720 },
        { x: 2600, y: 1950 },
        { x: 2800, y: 2150 }
      ],
      closed: false,
      width: 190,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 1
    },
    {
      id: 'water-bai-giua-song-hong',
      name: 'Bãi Giữa Sông Hồng',
      type: 'lake',
      points: [
        { x: 1820, y: 240 },
        { x: 1890, y: 200 },
        { x: 1970, y: 420 },
        { x: 1900, y: 500 }
      ],
      closed: true,
      color: '#E8F4EC',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-tay',
      name: 'Hồ Tây (West Lake - TÂY HỒ)',
      type: 'lake',
      points: [
        { x: 500, y: 0 },
        { x: 740, y: 0 },
        { x: 880, y: 70 },
        { x: 980, y: 200 },
        { x: 920, y: 350 },
        { x: 860, y: 380 },
        { x: 680, y: 390 },
        { x: 570, y: 270 },
        { x: 480, y: 140 },
        { x: 490, y: 40 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-truc-bach',
      name: 'Hồ Trúc Bạch',
      type: 'lake',
      points: [
        { x: 940, y: 380 },
        { x: 1000, y: 360 },
        { x: 1010, y: 440 },
        { x: 950, y: 430 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-dam-tron',
      name: 'Hồ Đầm Tròn',
      type: 'lake',
      points: [
        { x: 780, y: 470 },
        { x: 840, y: 460 },
        { x: 860, y: 520 },
        { x: 800, y: 530 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-thu-le',
      name: 'Hồ Công Viên Thủ Lệ',
      type: 'lake',
      points: [
        { x: 280, y: 800 },
        { x: 370, y: 780 },
        { x: 390, y: 880 },
        { x: 310, y: 910 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-giang-vo',
      name: 'Hồ Giảng Võ',
      type: 'lake',
      points: [
        { x: 680, y: 920 },
        { x: 760, y: 910 },
        { x: 780, y: 1000 },
        { x: 700, y: 990 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-thanh-cong',
      name: 'Hồ Thành Công',
      type: 'lake',
      points: [
        { x: 530, y: 1200 },
        { x: 610, y: 1190 },
        { x: 630, y: 1270 },
        { x: 550, y: 1280 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-bay-mau',
      name: 'Hồ Bảy Mẫu (Công viên Thống Nhất)',
      type: 'lake',
      points: [
        { x: 1360, y: 1320 },
        { x: 1510, y: 1300 },
        { x: 1540, y: 1490 },
        { x: 1430, y: 1510 },
        { x: 1370, y: 1440 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-ba-mau',
      name: 'Hồ Ba Mẫu',
      type: 'lake',
      points: [
        { x: 1320, y: 1420 },
        { x: 1360, y: 1410 },
        { x: 1370, y: 1480 },
        { x: 1330, y: 1490 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-dam-cang',
      name: 'Hồ Đầm Bờ Sông (Phân khu Cảng)',
      type: 'lake',
      points: [
        { x: 1600, y: 720 },
        { x: 1710, y: 700 },
        { x: 1740, y: 900 },
        { x: 1640, y: 910 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-hai-ba-trung',
      name: 'Hồ Hai Bà Trưng',
      type: 'lake',
      points: [
        { x: 1730, y: 1360 },
        { x: 1810, y: 1350 },
        { x: 1830, y: 1430 },
        { x: 1750, y: 1440 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    },
    {
      id: 'water-ho-thanh-nhan',
      name: 'Hồ Thanh Nhàn',
      type: 'lake',
      points: [
        { x: 1710, y: 1620 },
        { x: 1840, y: 1610 },
        { x: 1910, y: 1720 },
        { x: 1730, y: 1732 }
      ],
      closed: true,
      color: '#A4D8EE',
      opacity: 0.95,
      smooth: true,
      zIndex: 2
    }
  ],
  zones: [
    {
      id: 'zone-phan-khu-cang',
      name: 'Phân khu Cảng Hàng Hải Vĩnh Thụy',
      category: 'port',
      points: [
        { x: 1490, y: 360 },
        { x: 1780, y: 350 },
        { x: 1820, y: 880 },
        { x: 1510, y: 880 }
      ],
      fillColor: '#E2E8F0',
      strokeColor: '#94A3B8',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    },
    {
      id: 'zone-cang-tay',
      name: 'Phường Cảng Tây',
      category: 'commercial',
      points: [
        { x: 1160, y: 580 },
        { x: 1460, y: 580 },
        { x: 1480, y: 800 },
        { x: 1180, y: 800 }
      ],
      fillColor: '#EEF2F6',
      strokeColor: '#CBD5E1',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    },
    {
      id: 'zone-cang-dong',
      name: 'Cảng Đông (Bờ Đông Sông Hồng)',
      category: 'industrial',
      points: [
        { x: 2080, y: 320 },
        { x: 2600, y: 320 },
        { x: 2600, y: 780 },
        { x: 2080, y: 780 }
      ],
      fillColor: '#E5E7EB',
      strokeColor: '#94A3B8',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    },
    {
      id: 'zone-lac-ha',
      name: 'Phường Lạc Hà',
      category: 'residential',
      points: [
        { x: 1280, y: 60 },
        { x: 1660, y: 60 },
        { x: 1690, y: 300 },
        { x: 1300, y: 300 }
      ],
      fillColor: '#F8FAFC',
      strokeColor: '#CBD5E1',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    },
    {
      id: 'zone-cong-vien-thong-nhat',
      name: 'Công viên Thống Nhất',
      category: 'park',
      points: [
        { x: 1330, y: 1270 },
        { x: 1570, y: 1270 },
        { x: 1570, y: 1550 },
        { x: 1330, y: 1550 }
      ],
      fillColor: '#D1E7DD',
      strokeColor: '#A3CFBB',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    },
    {
      id: 'zone-cong-vien-bach-thao',
      name: 'Vườn Bách Thảo & Quảng trường Ba Đình',
      category: 'park',
      points: [
        { x: 860, y: 440 },
        { x: 1120, y: 440 },
        { x: 1120, y: 660 },
        { x: 860, y: 660 }
      ],
      fillColor: '#D5E8D4',
      strokeColor: '#A3CFBB',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    },
    {
      id: 'zone-cong-vien-thu-le',
      name: 'Công viên Thủ Lệ',
      category: 'park',
      points: [
        { x: 240, y: 760 },
        { x: 420, y: 760 },
        { x: 420, y: 940 },
        { x: 240, y: 940 }
      ],
      fillColor: '#D1E7DD',
      strokeColor: '#A3CFBB',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    },
    {
      id: 'zone-royal-city',
      name: 'Khu Đô Thị Royal City',
      category: 'commercial',
      points: [
        { x: 380, y: 1740 },
        { x: 580, y: 1740 },
        { x: 580, y: 1920 },
        { x: 380, y: 1920 }
      ],
      fillColor: '#EDE9FE',
      strokeColor: '#C4B5FD',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    },
    {
      id: 'zone-bach-khoa',
      name: 'Khu Đại Học Bách Khoa Hà Nội',
      category: 'custom',
      points: [
        { x: 1200, y: 1580 },
        { x: 1380, y: 1580 },
        { x: 1380, y: 1740 },
        { x: 1200, y: 1740 }
      ],
      fillColor: '#FEF3C7',
      strokeColor: '#FCD34D',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    },
    {
      id: 'zone-thanh-nhan',
      name: 'Khu Bệnh Viện Thanh Nhàn',
      category: 'custom',
      points: [
        { x: 1680, y: 1680 },
        { x: 1920, y: 1680 },
        { x: 1920, y: 1840 },
        { x: 1680, y: 1840 }
      ],
      fillColor: '#FEE2E2',
      strokeColor: '#FCA5A5',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    },
    {
      id: 'zone-trung-hoa',
      name: 'Khu Đô Thị Trung Hòa Nhân Chính',
      category: 'residential',
      points: [
        { x: 60, y: 1550 },
        { x: 320, y: 1550 },
        { x: 320, y: 1760 },
        { x: 60, y: 1760 }
      ],
      fillColor: '#F1F5F9',
      strokeColor: '#CBD5E1',
      strokeWidth: 1.5,
      opacity: 0.85,
      zIndex: 3
    }
  ],
  railways: [
    {
      id: 'railway-bac-nam',
      name: 'Đường Sắt Quốc Gia Bắc - Nam (qua Cầu Long Biên)',
      points: [
        { x: 1710, y: 2000 },
        { x: 1720, y: 1400 },
        { x: 1730, y: 1050 },
        { x: 1740, y: 720 },
        { x: 1750, y: 480 },
        { x: 1760, y: 420 },
        { x: 2000, y: 320 },
        { x: 2280, y: 210 },
        { x: 2600, y: 110 }
      ],
      width: 8,
      color: '#334155',
      sleeperSpacing: 14,
      smooth: true,
      zIndex: 11
    },
    {
      id: 'railway-metro-cat-linh',
      name: 'Tuyến Metro Trên Cao Cát Linh - Hà Đông',
      points: [
        { x: 940, y: 920 },
        { x: 810, y: 1030 },
        { x: 680, y: 1150 },
        { x: 560, y: 1330 },
        { x: 470, y: 1520 },
        { x: 350, y: 1720 },
        { x: 220, y: 1880 }
      ],
      width: 7,
      color: '#0284C7',
      sleeperSpacing: 16,
      smooth: true,
      zIndex: 12
    }
  ],
  roads: [
    {
      id: 'road-bridge-vinh-tuy',
      name: 'Cầu Vĩnh Tuy (Vượt Sông Hồng)',
      type: 'bridge',
      points: [
        { x: 2160, y: 1640 },
        { x: 2360, y: 1510 },
        { x: 2600, y: 1380 }
      ],
      width: 16,
      color: '#FFFFFF',
      casingColor: '#475569',
      casingWidth: 2.5,
      isBridge: true,
      smooth: true,
      zIndex: 15
    },
    {
      id: 'road-bridge-chuong-duong',
      name: 'Cầu Chương Dương (Vượt Sông Hồng)',
      type: 'bridge',
      points: [
        { x: 1760, y: 520 },
        { x: 1980, y: 440 },
        { x: 2260, y: 340 }
      ],
      width: 14,
      color: '#FFFFFF',
      casingColor: '#475569',
      casingWidth: 2,
      isBridge: true,
      smooth: true,
      zIndex: 15
    },
    {
      id: 'road-bridge-long-bien',
      name: 'Cầu Long Biên (Cầu Thép Lịch Sử)',
      type: 'bridge',
      points: [
        { x: 1760, y: 460 },
        { x: 1970, y: 370 },
        { x: 2220, y: 270 }
      ],
      width: 10,
      color: '#F8FAFC',
      casingColor: '#334155',
      casingWidth: 2,
      isBridge: true,
      smooth: true,
      zIndex: 14
    },
    {
      id: 'road-bridge-nhat-tan',
      name: 'Cầu Nhật Tân (Tuyến Cao Tốc Sân Bay)',
      type: 'bridge',
      points: [
        { x: 1420, y: 180 },
        { x: 1620, y: 120 },
        { x: 1820, y: 70 }
      ],
      width: 14,
      color: '#FFFFFF',
      casingColor: '#475569',
      casingWidth: 2,
      isBridge: true,
      smooth: true,
      zIndex: 15
    },
    {
      id: 'road-highway-vanh-dai-1',
      name: 'Trục Vành Đai 1 (Xã Đàn - Đại Cồ Việt)',
      type: 'highway',
      points: [
        { x: 250, y: 1410 },
        { x: 650, y: 1410 },
        { x: 1050, y: 1400 },
        { x: 1360, y: 1390 },
        { x: 1680, y: 1390 },
        { x: 2050, y: 1420 }
      ],
      width: 14,
      color: '#FFFFFF',
      casingColor: '#94A3B8',
      casingWidth: 2,
      smooth: true,
      zIndex: 10
    },
    {
      id: 'road-highway-vanh-dai-2',
      name: 'Trục Vành Đai 2 (Láng - Trường Chinh - Minh Khai)',
      type: 'highway',
      points: [
        { x: 380, y: 360 },
        { x: 320, y: 680 },
        { x: 380, y: 1050 },
        { x: 480, y: 1380 },
        { x: 780, y: 1560 },
        { x: 1100, y: 1600 },
        { x: 1650, y: 1580 },
        { x: 2160, y: 1640 }
      ],
      width: 14,
      color: '#FFFFFF',
      casingColor: '#94A3B8',
      casingWidth: 2,
      smooth: true,
      zIndex: 10
    },
    {
      id: 'road-avenue-kim-ma-tran-phu',
      name: 'Trục Kim Mã - Trần Phú - Ga Hà Nội',
      type: 'avenue',
      points: [
        { x: 180, y: 860 },
        { x: 480, y: 840 },
        { x: 780, y: 780 },
        { x: 1100, y: 760 },
        { x: 1450, y: 760 },
        { x: 1700, y: 780 }
      ],
      width: 11,
      color: '#FFFFFF',
      casingColor: '#CBD5E1',
      casingWidth: 1.8,
      smooth: true,
      zIndex: 9
    },
    {
      id: 'road-avenue-bo-song',
      name: 'Đường Bờ Sông (Tuyến Chính Vụ Án)',
      type: 'avenue',
      points: [
        { x: 1720, y: 350 },
        { x: 1708, y: 452 },
        { x: 1728, y: 550 },
        { x: 1740, y: 720 },
        { x: 1750, y: 920 },
        { x: 1730, y: 1100 }
      ],
      width: 9,
      color: '#FFFFFF',
      casingColor: '#94A3B8',
      casingWidth: 1.5,
      smooth: true,
      zIndex: 10
    },
    {
      id: 'road-avenue-doan-ket',
      name: 'Đường Đoàn Kết (Phân khu Cảng qua Cảng Đông)',
      type: 'avenue',
      points: [
        { x: 1480, y: 460 },
        { x: 1708, y: 452 },
        { x: 1994, y: 458 },
        { x: 2188, y: 502 }
      ],
      width: 9,
      color: '#FFFFFF',
      casingColor: '#94A3B8',
      casingWidth: 1.5,
      smooth: true,
      zIndex: 10
    },
    {
      id: 'road-avenue-cau-cang',
      name: 'Phố Cầu Cảng (Nối Chợ Cầu Cảng & Nhà Đạt Gà)',
      type: 'avenue',
      points: [
        { x: 1380, y: 410 },
        { x: 1462, y: 412 },
        { x: 1544, y: 422 },
        { x: 1708, y: 452 }
      ],
      width: 9,
      color: '#FFFFFF',
      casingColor: '#94A3B8',
      casingWidth: 1.5,
      smooth: false,
      zIndex: 10
    },
    {
      id: 'road-alley-bo-ke',
      name: 'Ngõ 12 Đường Bờ Kè (Phòng Trọ Vũ)',
      type: 'alley',
      points: [
        { x: 1740, y: 720 },
        { x: 1766, y: 734 },
        { x: 1820, y: 780 }
      ],
      width: 5,
      color: '#F8FAFC',
      casingColor: '#CBD5E1',
      casingWidth: 1,
      dashed: true,
      zIndex: 9
    },
    {
      id: 'road-avenue-giai-phong',
      name: 'Trục Đường Giải Phóng (đi Cầu Bươu & Giáp Bát)',
      type: 'avenue',
      points: [
        { x: 1360, y: 1390 },
        { x: 1350, y: 1650 },
        { x: 1340, y: 2000 }
      ],
      width: 12,
      color: '#FFFFFF',
      casingColor: '#94A3B8',
      casingWidth: 1.8,
      smooth: true,
      zIndex: 10
    },
    {
      id: 'road-highway-noi-bai',
      name: 'Đại Lộ Võ Nguyên Giáp (đi Sân Bay Nội Bài)',
      type: 'highway',
      points: [
        { x: 1200, y: 50 },
        { x: 1420, y: 180 }
      ],
      width: 14,
      color: '#FFFFFF',
      casingColor: '#94A3B8',
      casingWidth: 2,
      smooth: true,
      zIndex: 10
    }
  ],
  pois: [
    {
      id: 'poi-1',
      name: 'Số 14 Đường Bờ Sông (Hiện trường án mạng)',
      shortName: 'Số 14 Bờ Sông',
      category: 'crime_scene',
      x: 1708,
      y: 452,
      address: 'Số 14, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội',
      phone: '024 3828 9110',
      description: 'Hiện trường án mạng chính phát hiện thi thể nạn nhân Đỗ Tuấn Kiệt lúc rạng sáng.',
      clueNotes: 'Vết trượt bùn bờ sông, túi chống nước tang vật bị vướng tại cọc neo số 4.',
      badgeNumber: 1,
      zIndex: 25
    },
    {
      id: 'poi-2',
      name: 'Số 12 Đường Bờ Sông (Nhà bà Lụa)',
      shortName: 'Nhà bà Lụa',
      category: 'residential',
      x: 1728,
      y: 484,
      address: 'Số 12, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội',
      description: 'Nhà nhân chứng bà Lụa, quan sát thấy bóng người và đèn bật tắt bất thường lúc nửa đêm.',
      badgeNumber: 2,
      zIndex: 25
    },
    {
      id: 'poi-3',
      name: 'Số 10 Đường Bờ Sông (Nhà cũ bố mẹ Tùng)',
      shortName: 'Nhà cũ Tùng',
      category: 'residential',
      x: 1730,
      y: 520,
      address: 'Số 10, Đường Bờ Sông, P. Phân khu Cảng, Hà Nội',
      description: 'Ngôi nhà cũ của gia đình Tùng, hiện đã khóa cổng để hoang.',
      badgeNumber: 3,
      zIndex: 25
    },
    {
      id: 'poi-4',
      name: 'Bãi đất ven sông (Hiện trường 1996)',
      shortName: 'Bãi sông 1996',
      category: 'crime_scene',
      x: 1742,
      y: 384,
      address: 'Khu bãi bồi ven sông cũ, P. Phân khu Cảng, Hà Nội',
      description: 'Vị trí xảy ra vụ án đuối nước bí ẩn 10 năm trước.',
      badgeNumber: 4,
      zIndex: 25
    },
    {
      id: 'poi-5',
      name: 'Số 45 Đường Đoàn Kết (Nhà Mai & Vũ)',
      shortName: 'Nhà Mai & Vũ',
      category: 'residential',
      x: 2188,
      y: 502,
      address: 'Số 45, Đường Đoàn Kết, P. Cảng Đông, Hà Nội',
      description: 'Nơi cư trú của vợ chồng Mai và Đỗ Quốc Vũ.',
      badgeNumber: 5,
      zIndex: 25
    },
    {
      id: 'poi-6',
      name: 'Số 8 Ngõ 12 Đường Bờ Kè (Phòng trọ Hà)',
      shortName: 'Phòng trọ Hà',
      category: 'residential',
      x: 1766,
      y: 734,
      address: 'Số 8, Ngõ 12, Đường Bờ Kè, P. Phân khu Cảng, Hà Nội',
      description: 'Khu phòng trọ công nhân gần đường ray xe lửa.',
      badgeNumber: 6,
      zIndex: 25
    },
    {
      id: 'poi-7',
      name: 'Quán Bia 88 (Điểm tụ tập nghi phạm)',
      shortName: 'Quán Bia 88',
      category: 'food',
      x: 1994,
      y: 458,
      address: 'Số 88, Đường Vĩnh Hà, P. Cảng Đông, Hà Nội',
      phone: '024 3982 8888',
      description: 'Nơi các nghi phạm uống bia trước khi xảy ra vụ án mạng.',
      badgeNumber: 7,
      zIndex: 25
    },
    {
      id: 'poi-8',
      name: 'Số 52 Đường Cầu Cảng (Nhà Đạt Gà)',
      shortName: 'Nhà Đạt Gà',
      category: 'residential',
      x: 1462,
      y: 412,
      address: 'Số 52, Đường Cầu Cảng, P. Phân khu Cảng, Hà Nội',
      description: 'Nhà riêng của đối tượng tình nghi Đạt Gà.',
      badgeNumber: 8,
      zIndex: 25
    },
    {
      id: 'poi-9',
      name: 'Chợ Cầu Cảng (Sạp bán gia cầm)',
      shortName: 'Chợ Cầu Cảng',
      category: 'food',
      x: 1544,
      y: 422,
      address: 'Khu B, Chợ Dân sinh Cầu Cảng, Hà Nội',
      description: 'Sạp mổ gia cầm tại chợ dân sinh.',
      badgeNumber: 9,
      zIndex: 25
    },
    {
      id: 'poi-10',
      name: 'Bến xe khách Hoàng Long',
      shortName: 'Bến xe Hoàng Long',
      category: 'transit',
      x: 1760,
      y: 880,
      address: 'Đường Phân khu Cảng, Q. Sông Hồng, Hà Nội',
      phone: '024 3928 2828',
      description: 'Bến xe liên tỉnh phía đông thành phố.',
      badgeNumber: 10,
      zIndex: 25
    },
    {
      id: 'poi-11',
      name: 'Nhà nghỉ Hoàng Gia',
      shortName: 'Nhà nghỉ Hoàng Gia',
      category: 'residential',
      x: 2160,
      y: 530,
      address: 'Đường Đoàn Kết, P. Cảng Đông, Hà Nội',
      phone: '024 3862 9999',
      description: 'Nhà nghỉ nơi xuất hiện lịch trình ngoại phạm đáng ngờ.',
      badgeNumber: 11,
      zIndex: 25
    },
    {
      id: 'poi-12',
      name: 'Số 18 Phố Cầu Bươu (Lạc Hà / Nhà Tùng)',
      shortName: 'Số 18 Cầu Bươu',
      category: 'residential',
      x: 1348,
      y: 142,
      address: 'Số 18 Phố Cầu Bươu, Phường Lạc Hà, Hà Nội',
      description: 'Nơi ở hiện tại của đối tượng tình nghi Tùng.',
      badgeNumber: 12,
      zIndex: 25
    },
    {
      id: 'poi-13',
      name: 'Cty TNHH Vận tải Sông Hồng',
      shortName: 'Vận tải Sông Hồng',
      category: 'dock',
      x: 1568,
      y: 378,
      address: 'Số 15 Cảng Cát Lái, Hà Nội',
      phone: '024 3829 5566',
      description: 'Doanh nghiệp vận tải đường sông liên quan đến hợp đồng kho bãi.',
      badgeNumber: 13,
      zIndex: 25
    },
    {
      id: 'poi-14',
      name: 'CLB Billiards X-Club',
      shortName: 'CLB Billiards',
      category: 'food',
      x: 1620,
      y: 560,
      address: 'Số 68 Phố Vọng, Hai Bà Trưng, Hà Nội',
      phone: '0988 123 456',
      description: 'Câu lạc bộ giải trí nơi nhân chứng thấy xe máy nạn nhân xuất hiện.',
      badgeNumber: 14,
      zIndex: 25
    },
    {
      id: 'poi-15',
      name: 'Công an P. Phân khu Cảng',
      shortName: 'Công an Phân khu Cảng',
      category: 'transit',
      x: 1780,
      y: 500,
      address: 'Số 1 Đường Đoàn Kết, Hà Nội',
      phone: '024 3824 1133',
      description: 'Trụ sở công an phường tiếp nhận tin báo án đầu tiên.',
      badgeNumber: 15,
      zIndex: 25
    },
    {
      id: 'poi-16',
      name: 'Sân bay Quốc tế Nội Bài (T1)',
      shortName: 'Sân bay Nội Bài',
      category: 'transit',
      x: 1200,
      y: 50,
      address: 'Xã Phú Minh, Sóc Sơn, Hà Nội',
      phone: '1900 636 535',
      description: 'Cửa ngõ hàng không quốc tế.',
      badgeNumber: 16,
      zIndex: 25
    },
    {
      id: 'poi-17',
      name: 'Nhà nghỉ Đạt Phú (Cảng Tây)',
      shortName: 'Nhà nghỉ Đạt Phú',
      category: 'residential',
      x: 1268,
      y: 486,
      address: 'Ngõ 12 Đường Bờ Kè, Phường Cảng Tây, Hà Nội',
      phone: '024 3869 2929',
      description: 'Nhà nghỉ nơi lưu trú khả nghi trong đêm án mạng.',
      badgeNumber: 17,
      zIndex: 25
    },
    {
      id: 'poi-18',
      name: 'Quán Cơm Chị Ba',
      shortName: 'Quán Cơm Chị Ba',
      category: 'food',
      x: 1680,
      y: 500,
      address: 'Số 15 Cầu Cảng, Hà Nội',
      phone: '0908 334 991',
      description: 'Quán ăn bình dân phục vụ công nhân cảng.',
      badgeNumber: 18,
      zIndex: 25
    },
    {
      id: 'poi-19',
      name: 'Tiệm Giặt Là Chị Hạnh',
      shortName: 'Giặt Là Chị Hạnh',
      category: 'warehouse',
      x: 1300,
      y: 700,
      address: 'Số 22 Phố Cảng, Hà Nội',
      phone: '0914 556 789',
      description: 'Tiệm giặt sấy nơi tìm thấy vết bùn khoáng bất thường.',
      badgeNumber: 19,
      zIndex: 25
    },
    {
      id: 'poi-20',
      name: 'Bến phà Phân khu Cảng',
      shortName: 'Bến Phà Cảng',
      category: 'dock',
      x: 1840,
      y: 400,
      address: 'Bến Phà Cảng Sông Hồng, Hà Nội',
      description: 'Bến phà nối bờ tây sang bãi giữa Sông Hồng.',
      badgeNumber: 20,
      zIndex: 25
    },
    {
      id: 'poi-21',
      name: 'Trụ sở Phòng Cảnh sát Hình sự (PC02)',
      shortName: 'PC02 Số 7 Thiền Quang',
      category: 'transit',
      x: 900,
      y: 840,
      address: 'Số 7 Phố Thiền Quang, Hà Nội',
      phone: '024 3939 6113',
      description: 'Đại bản doanh ban chuyên án điều tra trọng án.',
      badgeNumber: 21,
      zIndex: 25
    },
    {
      id: 'poi-22',
      name: 'Viện Kiểm sát Nhân dân TP. Hà Nội',
      shortName: 'VKSND TP. Hà Nội',
      category: 'transit',
      x: 880,
      y: 800,
      address: 'TP. Hà Nội',
      description: 'Cơ quan kiểm sát điều tra và phê chuẩn lệnh bắt.',
      badgeNumber: 22,
      zIndex: 25
    },
    {
      id: 'poi-23',
      name: 'Tòa án Nhân dân Q. Sông Hồng',
      shortName: 'TAND Q. Sông Hồng',
      category: 'transit',
      x: 1200,
      y: 760,
      address: 'Q. Sông Hồng, Hà Nội',
      description: 'Trụ sở Tòa án nhân dân quận.',
      badgeNumber: 23,
      zIndex: 25
    },
    {
      id: 'poi-24',
      name: 'Ngân hàng TMCP GreenAgri (Chi nhánh Cầu Cảng)',
      shortName: 'Ngân hàng GreenAgri',
      category: 'dock',
      x: 1640,
      y: 540,
      address: 'Đường Cầu Cảng, Hà Nội',
      description: 'Nơi thực hiện các giao dịch rút tiền và sao kê tài khoản của nạn nhân.',
      badgeNumber: 24,
      zIndex: 25
    },
    {
      id: 'poi-25',
      name: 'Phòng Tài nguyên & Môi trường Q. Sông Hồng',
      shortName: 'Phòng TN&MT',
      category: 'warehouse',
      x: 1220,
      y: 740,
      address: 'Q. Sông Hồng, Hà Nội',
      description: 'Lưu trữ bản đồ quy hoạch đất đai và giấy chứng nhận quyền sử dụng đất.',
      badgeNumber: 25,
      zIndex: 25
    },
    {
      id: 'poi-26',
      name: 'Phòng Kỹ thuật Hình sự (PC54)',
      shortName: 'PC54 Pháp Y',
      category: 'transit',
      x: 920,
      y: 820,
      address: 'TP. Hà Nội',
      description: 'Nơi tiến hành giải phẫu tử thi, xét nghiệm độc chất và giám định vân tay.',
      badgeNumber: 26,
      zIndex: 25
    },
    {
      id: 'poi-lotte',
      name: 'Khách sạn Lotte Hà Nội',
      shortName: 'Lotte Hà Nội',
      category: 'food',
      x: 550,
      y: 750,
      address: '54 Liễu Giai, Ba Đình, Hà Nội',
      zIndex: 25
    },
    {
      id: 'poi-vtv',
      name: 'Đài Truyền hình Việt Nam (VTV)',
      shortName: 'Đài THVN VTV',
      category: 'transit',
      x: 520,
      y: 960,
      address: '43 Nguyễn Chí Thanh, Ba Đình, Hà Nội',
      zIndex: 25
    },
    {
      id: 'poi-bachkhoa',
      name: 'Đại học Bách Khoa Hà Nội',
      shortName: 'ĐH Bách Khoa',
      category: 'warehouse',
      x: 1300,
      y: 1670,
      address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      zIndex: 25
    },
    {
      id: 'poi-thanhnhan',
      name: 'Bệnh viện Thanh Nhàn',
      shortName: 'BV Thanh Nhàn',
      category: 'crime_scene',
      x: 1850,
      y: 1760,
      address: '42 Thanh Nhàn, Hai Bà Trưng, Hà Nội',
      zIndex: 25
    },
    {
      id: 'poi-royalcity',
      name: 'KHU ĐÔ THỊ ROYAL CITY',
      shortName: 'Royal City',
      category: 'food',
      x: 480,
      y: 1820,
      address: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
      zIndex: 25
    }
  ],
  labels: [
    {
      id: 'label-song-hong',
      text: 'S Ô N G   H Ồ N G   ( R E D   R I V E R )',
      x: 2150,
      y: 1180,
      fontSize: 24,
      rotation: 62,
      letterSpacing: 8,
      fontWeight: 'bold',
      color: '#3B82F6',
      zIndex: 20
    },
    {
      id: 'label-tay-ho',
      text: 'T Â Y   H Ồ',
      x: 800,
      y: 120,
      fontSize: 22,
      letterSpacing: 6,
      fontWeight: 'bold',
      color: '#1D4ED8',
      zIndex: 20
    },
    {
      id: 'label-phan-khu-cang',
      text: 'P H Â N   K H U   C Ả N G',
      x: 1660,
      y: 700,
      fontSize: 18,
      letterSpacing: 4,
      fontWeight: 'bold',
      color: '#334155',
      zIndex: 20
    },
    {
      id: 'label-cang-tay',
      text: 'C Ả N G   T Â Y',
      x: 1240,
      y: 680,
      fontSize: 18,
      letterSpacing: 4,
      fontWeight: 'bold',
      color: '#475569',
      zIndex: 20
    },
    {
      id: 'label-cang-dong',
      text: 'C Ả N G   Đ Ô N G',
      x: 2320,
      y: 400,
      fontSize: 18,
      letterSpacing: 4,
      fontWeight: 'bold',
      color: '#475569',
      zIndex: 20
    },
    {
      id: 'label-lac-ha',
      text: 'L Ạ C   H À',
      x: 1420,
      y: 100,
      fontSize: 18,
      letterSpacing: 4,
      fontWeight: 'bold',
      color: '#475569',
      zIndex: 20
    },
    {
      id: 'label-cau-vinh-tuy',
      text: 'C Ầ U   V Ĩ N H   T U Y',
      x: 2340,
      y: 1670,
      fontSize: 14,
      letterSpacing: 2,
      fontWeight: 'bold',
      color: '#334155',
      zIndex: 20
    },
    {
      id: 'label-cau-long-bien',
      text: 'C Ầ U   L O N G   B I Ê N',
      x: 1980,
      y: 390,
      fontSize: 13,
      rotation: -22,
      letterSpacing: 2,
      fontWeight: 'bold',
      color: '#334155',
      zIndex: 20
    },
    {
      id: 'label-cau-chuong-duong',
      text: 'C Ầ U   C H Ư Ơ N G   D Ư Ơ N G',
      x: 2020,
      y: 470,
      fontSize: 13,
      rotation: -20,
      letterSpacing: 2,
      fontWeight: 'bold',
      color: '#334155',
      zIndex: 20
    },
    {
      id: 'label-royal-city',
      text: 'K H U   Đ Ô   T H Ị   R O Y A L   C I T Y',
      x: 480,
      y: 1850,
      fontSize: 12,
      letterSpacing: 2,
      fontWeight: 'bold',
      color: '#475569',
      zIndex: 20
    },
    {
      id: 'label-trung-hoa',
      text: 'T R U N G   H Ò A   N H Â N   C H Í N H',
      x: 180,
      y: 1650,
      fontSize: 12,
      letterSpacing: 2,
      fontWeight: 'bold',
      color: '#475569',
      zIndex: 20
    }
  ],
  updatedAt: new Date().toISOString()
}

if (!fs.existsSync(MAPS_DIR)) {
  fs.mkdirSync(MAPS_DIR, { recursive: true })
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(figmaVectorMap, null, 2), 'utf-8')
const stats = fs.statSync(OUTPUT_FILE)
console.log(`✅ Đã vẽ và ghi thành công bản đồ chuẩn Figma vào database file: ${OUTPUT_FILE}`)
console.log(`📦 Kích thước file dữ liệu: ${(stats.size / 1024).toFixed(1)} KB`)
console.log(`🗺️ Số lượng phần tử đã vẽ:`)
console.log(`   - Sông / Hồ nước: ${figmaVectorMap.water.length}`)
console.log(`   - Tuyến đường bộ & Cầu: ${figmaVectorMap.roads.length}`)
console.log(`   - Tuyến đường ray & Metro: ${figmaVectorMap.railways.length}`)
console.log(`   - Phân khu chức năng: ${figmaVectorMap.zones.length}`)
console.log(`   - Mốc địa danh (POIs): ${figmaVectorMap.pois.length}`)
console.log(`   - Nhãn chữ typography: ${figmaVectorMap.labels.length}`)
