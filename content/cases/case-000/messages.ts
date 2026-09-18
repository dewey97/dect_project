import { Conversation } from '@/lib/types'

export const conversations000: Record<string, Conversation[]> = {
  'dev-00': [
    // -------------------------------------------------------------------------
    // THREAD 1: Thảo Vy (Đã lưu danh bạ — Tin cuối: 24/07 lúc 20:40)
    // -------------------------------------------------------------------------
    {
      id: 'conv-01',
      name: 'Thảo Vy',
      phoneNumber: '0978.552.109',
      avatarColor: 'from-[#FF2D55] to-[#FF375F]',
      timestamp: '20:40',
      previewText: 'Ok, vậy hẹn anh 9h tối ở địa chỉ cũ.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        // 04/05/2016
        {
          id: 'm1-1',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Khoản đợt một em chuẩn bị xong tiền mặt rồi nhé. Tối mai tầm mấy giờ anh tiện nhận tiền?',
          timestamp: '04/05 • 14:15'
        },
        {
          id: 'm1-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Tối mai 21h qua số X đường ABC. Giờ đấy anh mới xong việc ở chỗ công trình. Nhớ mang đủ giấy tờ.',
          timestamp: '04/05 • 14:32',
          status: 'Đã gửi • 14:32'
        },
        {
          id: 'm1-3',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Oke anh',
          timestamp: '04/05 • 14:35'
        },
        // 22/05/2016
        {
          id: 'm1-4',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Khoản nợ mới lúc nào anh chuyển nốt em phần còn lại được? Em đang kẹt quá',
          timestamp: '22/05 • 10:20'
        },
        {
          id: 'm1-5',
          sender: 'Khang',
          role: 'sent',
          text: 'Cuối tuần này chuyển tiếp phần còn lại nhé.',
          timestamp: '22/05 • 11:05',
          status: 'Đã gửi • 11:05'
        },
        {
          id: 'm1-6',
          sender: 'Khang',
          role: 'sent',
          text: 'Cứ tối ra đúng địa chỉ cũ tôi đưa tiền, đừng chuyển khoản lằng nhằng mất công đối soát.',
          timestamp: '22/05 • 11:06',
          status: 'Đã gửi • 11:06'
        },
        // 25/05/2016
        {
          id: 'm1-7',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Tối nay vẫn số X đường ABC anh nhỉ?',
          timestamp: '25/05 • 16:48'
        },
        {
          id: 'm1-8',
          sender: 'Khang',
          role: 'sent',
          text: 'Ừ cứ chỗ cũ mà quất thôi',
          timestamp: '25/05 • 16:49',
          status: 'Đã gửi • 16:49'
        },
        {
          id: 'm1-9',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Anh nhẹ nhàng với em thôi, không phải là chủ nợ mà mún làm gì thì làm đâu',
          timestamp: '25/05 • 17:00'
        },
        // 12/06/2016
        {
          id: 'm1-10',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Hôm nay em gửi lãi tháng 6 được không?',
          timestamp: '12/06 • 16:40'
        },
        {
          id: 'm1-11',
          sender: 'Khang',
          role: 'sent',
          text: 'Tầm 9 giờ tối đi, giờ đấy vắng người dễ làm việc. Mà hôm nay đừng có lề mề như lần trước.',
          timestamp: '12/06 • 17:15',
          status: 'Đã gửi • 17:15'
        },
        {
          id: 'm1-12',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Lần trước do kẹt xe thôi. Anh khó tính vừa thôi chứ.',
          timestamp: '12/06 • 17:18'
        },
        {
          id: 'm1-13',
          sender: 'Khang',
          role: 'sent',
          text: 'Không khó tính để bị trễ việc à? Vừa bực mình với con người yêu trời đánh xong. Trông chán phát khiếp.',
          timestamp: '12/06 • 17:22',
          status: 'Đã gửi • 17:22'
        },
        {
          id: 'm1-14',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Mà anh hay đi với em thế chị Hà có nghĩ gì k đấy',
          timestamp: '12/06 • 17:28'
        },
        {
          id: 'm1-15',
          sender: 'Khang',
          role: 'sent',
          text: 'Lắm chuyện, con mẹ ấy thì biết gì anh sắp chia tay với nó rồi kệ nó đi',
          timestamp: '12/06 • 17:49',
          status: 'Đã gửi • 17:49'
        },
        // 03/07/2016
        {
          id: 'm1-16',
          sender: 'Khang',
          role: 'sent',
          text: 'Anh mới kiểm tra lại sổ',
          timestamp: '03/07 • 22:01',
          status: 'Đã gửi • 22:01'
        },
        {
          id: 'm1-17',
          sender: 'Khang',
          role: 'sent',
          text: 'Nhớ ngày mai trả lãi tháng 7 đấy',
          timestamp: '03/07 • 22:01',
          status: 'Đã gửi • 22:01'
        },
        {
          id: 'm1-18',
          sender: 'Khang',
          role: 'sent',
          text: 'Em nhớ trả anh đúng hạn. Không liệu hồn',
          timestamp: '03/07 • 22:01',
          status: 'Đã gửi • 22:01'
        },
        {
          id: 'm1-19',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Em biết rồi.',
          timestamp: '03/07 • 22:03'
        },
        {
          id: 'm1-20',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Cũng may là em chuẩn bị trước rồi.',
          timestamp: '03/07 • 22:03'
        },
        {
          id: 'm1-21',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Nhớ mai cho em vay thêm vài chục với. Em đang kẹt xíu.',
          timestamp: '03/07 • 22:03'
        },
        {
          id: 'm1-22',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Anh khỏi lo em đã khất nợ bao giờ đâu',
          timestamp: '03/07 • 22:03'
        },
        // 24/07/2016
        {
          id: 'm1-23',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Đợt cuối cùng gom xong rồi. Tối nay hẹn ở đâu để tất toán dứt điểm đây?',
          timestamp: '24/07 • 19:05'
        },
        {
          id: 'm1-24',
          sender: 'Khang',
          role: 'sent',
          text: 'Cứ hẹn buổi tối ở địa chỉ cũ như mọi khi thôi.',
          timestamp: '24/07 • 19:20',
          status: 'Đã gửi • 19:20'
        },
        {
          id: 'm1-25',
          sender: 'Thảo Vy',
          role: 'received',
          text: '',
          timestamp: '24/07 • 20:38',
          attachment: {
            type: 'audio',
            duration: '0:06'
          }
        },
        {
          id: 'm1-26',
          sender: 'Thảo Vy',
          role: 'received',
          text: 'Ok, vậy hẹn anh 9h tối ở địa chỉ cũ.',
          timestamp: '24/07 • 20:40',
          status: 'Đã nhận • 20:40'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 2: Hà (Đã lưu danh bạ — Tin cuối: 24/07 lúc 20:32)
    // -------------------------------------------------------------------------
    {
      id: 'conv-02',
      name: 'Hà',
      phoneNumber: '0984.112.568',
      avatarColor: 'from-[#FF375F] to-[#AF52DE]',
      isMuted: true,
      timestamp: '20:32',
      previewText: 'Tin nhắn thoại (0:08)',
      recoveryProgress: 100,
      unread: true,
      messages: [
        // 22/07/2016
        {
          id: 'm2-1',
          sender: 'Hà',
          role: 'received',
          text: 'Anh Khang ơi, hôm nay em nấu canh cua với rau đay, anh thích món đó mà. Để em mang sang cho anh nhé? Em biết anh hay quên ăn tối...',
          timestamp: '22/07 • 21:17'
        },
        {
          id: 'm2-2',
          sender: 'Hà',
          role: 'received',
          text: 'Anh không trả lời à... Không sao, em để phần anh trong hộp cơm ở trước cửa nhé. Anh nhớ lấy vào ăn kẻo nguội.',
          timestamp: '22/07 • 22:03',
          status: 'Đã xem • Không trả lời'
        },
        // 23/07/2016
        {
          id: 'm2-3',
          sender: 'Hà',
          role: 'received',
          text: 'Em thấy hộp cơm hôm qua anh đã lấy vào rồi 🥰 Vậy là anh có ăn phải không? Chiều nay em nghỉ sớm, hay để em ghé qua dọn nhà cho anh nh?',
          timestamp: '23/07 • 12:44'
        },
        {
          id: 'm2-4',
          sender: 'Khang',
          role: 'sent',
          text: 'Đừng có sang. Bận.',
          timestamp: '23/07 • 14:51',
          status: 'Đã gửi • 14:51'
        },
        // 24/07/2016
        {
          id: 'm2-5',
          sender: 'Hà',
          role: 'received',
          text: 'Anh ơi, em vừa sao xong mẻ trà hoa cúc mới, thơm lắm anh. Lát anh có ở nhà không, em mang qua cho anh nhé?',
          timestamp: '24/07 • 19:00',
          status: '🔕 Đã gửi • Đã tắt thông báo'
        },
        {
          id: 'm2-6',
          sender: 'Hà',
          role: 'received',
          text: '',
          timestamp: '24/07 • 20:32',
          attachment: {
            type: 'audio',
            duration: '0:08',
            audioClue:
              '⚠️ Tạp âm nền lọt tiếng còi tàu hỏa diesel hú 2 hồi dài và tiếng chuông rào chắn đường sắt leng keng (Khoảng cách < 30m) chứng minh Hà đứng sát nhà Khang tại ngõ Bờ Sông!'
          },
          isClue: true,
          clueTitle: 'Tin nhắn thoại của Hà lúc 20:32 lọt tiếng còi tàu Bờ Sông',
          clueAnalysis:
            'Đoạn ghi âm thoại lúc 20:32 ngày 24/07 của Hà thu được tiếng chuông gác chắn đường sắt và 2 hồi còi tàu hỏa diesel đặc trưng (chuyến tàu HBN-203 qua ngõ Bờ Sông lúc 20:30-20:33), chứng minh lời khai của Hà ở phòng trọ xem phim lúc xảy ra vụ án là hoàn toàn ngụy tạo.'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 3: 0988.200.991 (Chưa lưu danh bạ — Sim rác Lê Quang Vũ — Tin cuối: 24/07 lúc 18:12)
    // -------------------------------------------------------------------------
    {
      id: 'conv-03',
      name: '0988.200.991',
      phoneNumber: '0988.200.991',
      avatarColor: 'from-[#0A84FF] to-[#5E5CE6]',
      timestamp: '18:12',
      previewText: 'T cho m cơ hội cuối. Tối nay qua nhà tao nói chuyện cho đàng hoàng...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        // 21/07/2016
        {
          id: 'm3-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Hạn 20 rồi mày không thấy lịch à. 300 triệu không phải 300 nghìn. Tắt máy trốn thì tao tìm đến tận nhà mày.',
          timestamp: '21/07 • 09:14',
          status: 'Đã gửi • 09:14'
        },
        // 22/07/2016
        {
          id: 'm3-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Mày nghĩ tắt máy là xong à?',
          timestamp: '22/07 • 20:31',
          status: 'Đã gửi • 20:31'
        },
        {
          id: 'm3-3',
          sender: 'Khang',
          role: 'sent',
          text: 'Ngày mai không gọi lại tao thì tao cho rải giấy nợ để cả phố biết mặt thằng rể quý nhà họ Nguyễn.',
          timestamp: '22/07 • 20:31',
          status: 'Đã gửi • 20:31'
        },
        // 24/07/2016
        {
          id: 'm3-4',
          sender: 'Khang',
          role: 'sent',
          text: 'T cho m cơ hội cuối. Tối nay qua nhà tao nói chuyện cho đàng hoàng. Không thì ngày mai tao ghé nhà máy thăm bố vợ mày luôn thể.',
          timestamp: '24/07 • 18:12',
          status: 'Đã gửi • 18:12'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 4: VIETTEL_KM (Brandname Nhà Mạng — Tin cuối: 23/07 lúc 10:00)
    // -------------------------------------------------------------------------
    {
      id: 'conv-04',
      name: 'VIETTEL_KM',
      phoneNumber: '198',
      avatarColor: 'from-[#FF3B30] to-[#FF9500]',
      timestamp: '23/07 • 10:00',
      previewText: '[QC] Dang ky goi cuoc 3G Mimax chi voi 70.000d/thang co ngay 600MB...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm4-1',
          sender: 'VIETTEL_KM',
          role: 'received',
          text: '[QC] Duy nhat ngay 05/07/2016, Viettel KM 50% gia tri the nap cho thue bao tra truoc. Chi tiet lien he 198 (0d).',
          timestamp: '05/07 • 08:00'
        },
        {
          id: 'm4-2',
          sender: 'VIETTEL_KM',
          role: 'received',
          text: '[QC] Tu 00h-24h ngay 20/07/2016, Viettel KM 50% gia tri the nap cho thue bao tra truoc (25% cong vao TK KM, 25% cong vao TK KM2). Chi tiet LH 198 (0d).',
          timestamp: '20/07 • 08:30'
        },
        {
          id: 'm4-3',
          sender: 'VIETTEL_KM',
          role: 'received',
          text: '[QC] Dang ky goi cuoc 3G Mimax chi voi 70.000d/thang co ngay 600MB toc do cao, het luu luong truy cap mien phi. Soan MIMAX gui 191.',
          timestamp: '23/07 • 10:00'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 5: 0912.331.888 (Chưa lưu danh bạ — Nguyễn Thanh Tùng — Tin cuối: 22/07 lúc 20:20)
    // -------------------------------------------------------------------------
    {
      id: 'conv-05',
      name: '0912.331.888',
      phoneNumber: '0912.331.888',
      avatarColor: 'from-[#FF9F0A] to-[#FF453A]',
      timestamp: '22/07 • 20:20',
      previewText: 'Thằng nào đấy?',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm5-1',
          sender: '0912.331.888',
          role: 'received',
          text: '20 năm qua mày sống tốt nhỉ',
          timestamp: '22/07 • 20:15'
        },
        {
          id: 'm5-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Thằng nào đấy?',
          timestamp: '22/07 • 20:20',
          status: 'Đã gửi • 20:20'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 6: Cơm Chị Ba (Đã lưu danh bạ — Tin cuối: 22/07 lúc 11:33)
    // -------------------------------------------------------------------------
    {
      id: 'conv-06',
      name: 'Cơm Chị Ba',
      phoneNumber: '0908.334.991',
      avatarColor: 'from-[#30D158] to-[#34C759]',
      timestamp: '22/07 • 11:33',
      previewText: 'Vâng cho 1 phần cơm cá kho + canh chua.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm6-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Cho em 2 suất sườn bì chả nhiều ớt cay qua 14 Bờ Sông chị nhé.',
          timestamp: '18/07 • 11:20',
          status: 'Đã gửi • 11:20'
        },
        {
          id: 'm6-2',
          sender: 'Cơm Chị Ba',
          role: 'received',
          text: 'Có ngay em ơi, 15 phút nữa chú xe ôm mang qua nhé.',
          timestamp: '18/07 • 11:25'
        },
        {
          id: 'm6-3',
          sender: 'Khang',
          role: 'sent',
          text: 'Trưa nay có cá kho tộ với canh chua không chị?',
          timestamp: '22/07 • 11:30',
          status: 'Đã gửi • 11:30'
        },
        {
          id: 'm6-4',
          sender: 'Cơm Chị Ba',
          role: 'received',
          text: 'Có cá hú kho tộ ngon lắm em, lấy thêm chén canh chua nha?',
          timestamp: '22/07 • 11:32'
        },
        {
          id: 'm6-5',
          sender: 'Khang',
          role: 'sent',
          text: 'Vâng cho 1 phần cơm cá kho + canh chua.',
          timestamp: '22/07 • 11:33',
          status: 'Đã gửi • 11:33'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 7: Chị Hạnh Giặt Là (Đã lưu danh bạ — Tin cuối: 21/07 lúc 15:35)
    // -------------------------------------------------------------------------
    {
      id: 'conv-07',
      name: 'Chị Hạnh Giặt Là',
      phoneNumber: '0914.556.789',
      avatarColor: 'from-[#5856D6] to-[#AF52DE]',
      timestamp: '21/07 • 15:35',
      previewText: 'Vâng chiều em cho thằng Long qua vác về.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm7-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Chị Hạnh ơi em gửi thằng đệ mang 1 cái áo khoác da với 2 chăn lông qua giặt khô, làm cẩn thận hộ em.',
          timestamp: '12/07 • 16:00',
          status: 'Đã gửi • 16:00'
        },
        {
          id: 'm7-2',
          sender: 'Chị Hạnh Giặt Là',
          role: 'received',
          text: 'Rồi chị nhận được rồi, giặt hấp da mất 2-3 hôm em nhé.',
          timestamp: '12/07 • 16:10'
        },
        {
          id: 'm7-3',
          sender: 'Chị Hạnh Giặt Là',
          role: 'received',
          text: 'Đồ giặt xong rồi em ơi, tiện ghé lấy nhé.',
          timestamp: '15/07 • 17:00'
        },
        {
          id: 'm7-4',
          sender: 'Chị Hạnh Giặt Là',
          role: 'received',
          text: 'Khang ơi áo da với chăn của em giặt xong cả tuần rồi để chật tiệm quá, chiều tiện ghé 42 Khâm Thiên lấy hộ chị.',
          timestamp: '21/07 • 15:20'
        },
        {
          id: 'm7-5',
          sender: 'Khang',
          role: 'sent',
          text: 'Vâng chiều em cho thằng Long qua vác về.',
          timestamp: '21/07 • 15:35',
          status: 'Đã gửi • 15:35'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 8: Long Sẹo (Đã lưu danh bạ — Tin cuối: 21/07 lúc 11:16)
    // -------------------------------------------------------------------------
    {
      id: 'conv-08',
      name: 'Long Sẹo',
      phoneNumber: '0979.441.223',
      avatarColor: 'from-[#8E8E93] to-[#636366]',
      timestamp: '21/07 • 11:16',
      previewText: 'Giữ luôn chìa khóa xe nó, bảo khi nào mang đủ 75 triệu...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm8-1',
          sender: 'Long Sẹo',
          role: 'received',
          text: 'Anh Khang ơi em dán xong 50 tờ thông báo nợ quanh khu chợ đầu mối rồi nhé.',
          timestamp: '08/07 • 09:10'
        },
        {
          id: 'm8-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Tốt, tối lượn qua bến phà ngó xem có động tĩnh gì không.',
          timestamp: '08/07 • 09:30',
          status: 'Đã gửi • 09:30'
        },
        {
          id: 'm8-3',
          sender: 'Khang',
          role: 'sent',
          text: 'Mày thấy thằng Hải Lác chạy xe ở bến chưa?',
          timestamp: '19/07 • 14:00',
          status: 'Đã gửi • 14:00'
        },
        {
          id: 'm8-4',
          sender: 'Long Sẹo',
          role: 'received',
          text: 'Em đảo qua 2 vòng mà bọn xe ôm bảo nó nghỉ ốm mấy hôm nay rồi anh ạ.',
          timestamp: '19/07 • 16:45'
        },
        {
          id: 'm8-5',
          sender: 'Long Sẹo',
          role: 'received',
          text: 'Anh ơi em vừa tóm được quả xe Dream của nó dựng ở quán nước đầu bến!',
          timestamp: '21/07 • 11:15'
        },
        {
          id: 'm8-6',
          sender: 'Khang',
          role: 'sent',
          text: 'Giữ luôn chìa khóa xe nó, bảo khi nào mang đủ 75 triệu đến nhà tao thì trả xe.',
          timestamp: '21/07 • 11:16',
          status: 'Đã gửi • 11:16'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 9: Tuấn Béo Xưởng Mộc (Đã lưu danh bạ — Con nợ — Tin cuối: 21/07 lúc 10:25)
    // -------------------------------------------------------------------------
    {
      id: 'conv-09',
      name: 'Tuấn Béo Xưởng Mộc',
      phoneNumber: '0902.998.114',
      avatarColor: 'from-[#FF9500] to-[#FF3B30]',
      timestamp: '21/07 • 10:25',
      previewText: 'Biết điều đấy, trước 30/7 nốt 25 triệu còn lại...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        // 08/06/2016
        {
          id: 'm9-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Tuấn, tiền gỗ đợt trước 45 triệu đến hạn rồi. Chiều tao cho người qua lấy.',
          timestamp: '08/06 • 09:00',
          status: 'Đã gửi • 09:00'
        },
        {
          id: 'm9-2',
          sender: 'Tuấn Béo Xưởng Mộc',
          role: 'received',
          text: 'Anh Khang ơi đợt này bên chủ nhà họ chậm thanh toán quá, anh thư thư cho em mấy hôm với ạ.',
          timestamp: '08/06 • 09:15'
        },
        // 25/06/2016
        {
          id: 'm9-3',
          sender: 'Khang',
          role: 'sent',
          text: 'Mấy hôm của mày là nửa tháng rồi đấy à? Đừng để tao phải mang mấy anh em xuống tận xưởng mộc bốc máy cưa máy bào đi.',
          timestamp: '25/06 • 14:30',
          status: 'Đã gửi • 14:30'
        },
        {
          id: 'm9-4',
          sender: 'Tuấn Béo Xưởng Mộc',
          role: 'received',
          text: 'Em lạy anh, anh cho em xin đến đầu tháng 7 công trình xong em thanh toán đủ cả gốc lẫn lãi cho anh!',
          timestamp: '25/06 • 14:45'
        },
        // 10/07/2016
        {
          id: 'm9-5',
          sender: 'Khang',
          role: 'sent',
          text: 'Mày trốn tao à? Gọi điện không nghe máy là muốn xưởng đỏ lửa đúng không?',
          timestamp: '10/07 • 11:00',
          status: 'Đã gửi • 11:00'
        },
        {
          id: 'm9-6',
          sender: 'Tuấn Béo Xưởng Mộc',
          role: 'received',
          text: 'Dạ không em vừa bận giao hàng trên phố không cầm máy. Anh cho em gom nốt tuần này em trả anh trước một nửa!',
          timestamp: '10/07 • 11:20'
        },
        // 21/07/2016
        {
          id: 'm9-7',
          sender: 'Tuấn Béo Xưởng Mộc',
          role: 'received',
          text: '',
          timestamp: '21/07 • 10:20',
          attachment: {
            type: 'audio',
            duration: '0:12'
          }
        },
        {
          id: 'm9-8',
          sender: 'Khang',
          role: 'sent',
          text: 'Biết điều đấy, trước 30/7 nốt 25 triệu còn lại không thì đừng trách tao.',
          timestamp: '21/07 • 10:25',
          status: 'Đã gửi • 10:25'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 10: VNPT_Notice (Brandname Dịch Vụ — Tin cuối: 21/07 lúc 08:00)
    // -------------------------------------------------------------------------
    {
      id: 'conv-10',
      name: 'VNPT_Notice',
      phoneNumber: 'VNPT',
      avatarColor: 'from-[#0A84FF] to-[#30D158]',
      timestamp: '21/07 • 08:00',
      previewText: '[Thong bao] Thue bao 0904888666 da thanh toan cuoc Internet...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm10-1',
          sender: 'VNPT_Notice',
          role: 'received',
          text: '[Thong bao] Cuoc Internet FiberVNN thang 06/2016 cua thue bao 0904888666 la 220.000d. Han thanh toan: 20/07/2016.',
          timestamp: '10/07 • 08:30'
        },
        {
          id: 'm10-2',
          sender: 'VNPT_Notice',
          role: 'received',
          text: '[Thong bao] Thue bao 0904888666 da thanh toan cuoc Internet FiberVNN thang 06/2016 so tien 220.000d qua ViettinBank. Cam on Quy khach.',
          timestamp: '21/07 • 08:00'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 11: Tuấn Bia 88 (Đã lưu danh bạ — Tin cuối: 20/07 lúc 18:45)
    // -------------------------------------------------------------------------
    {
      id: 'conv-11',
      name: 'Tuấn Bia 88',
      phoneNumber: '0945.888.188',
      avatarColor: 'from-[#FFD60A] to-[#FF9500]',
      timestamp: '20/07 • 18:45',
      previewText: 'Tối bận đi thu nợ rồi ông. Để bữa khác.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm11-1',
          sender: 'Tuấn Bia 88',
          role: 'received',
          text: 'Tối nay chung kết Euro Pháp - Bồ Đào Nha ra quán làm nồi lẩu xem bóng đá không Khang ơi? Có mấy anh em xóm Cảng nữa.',
          timestamp: '10/07 • 17:40'
        },
        {
          id: 'm11-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Bận rồi, tối phải đi chốt mấy khoản họ.',
          timestamp: '10/07 • 18:15',
          status: 'Đã gửi • 18:15'
        },
        {
          id: 'm11-3',
          sender: 'Khang',
          role: 'sent',
          text: 'Trưa nay quán có lòng non với cháo lòng không ông?',
          timestamp: '15/07 • 11:20',
          status: 'Đã gửi • 11:20'
        },
        {
          id: 'm11-4',
          sender: 'Tuấn Bia 88',
          role: 'received',
          text: 'Có luôn ông ơi, vừa mổ lòng tươi rói. Ra nhanh kẻo hết.',
          timestamp: '15/07 • 11:22'
        },
        {
          id: 'm11-5',
          sender: 'Tuấn Bia 88',
          role: 'received',
          text: 'Khang ơi, tối nay rảnh ra làm vài cốc bia hơi phố cổ không ông? Lô bia hơi Hà Nội mới về mát lịm.',
          timestamp: '20/07 • 18:30'
        },
        {
          id: 'm11-6',
          sender: 'Khang',
          role: 'sent',
          text: 'Tối bận đi thu nợ rồi ông. Để bữa khác.',
          timestamp: '20/07 • 18:45',
          status: 'Đã gửi • 18:45'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 12: Duy Bida 88 (Đã lưu danh bạ — Tin cuối: 20/07 lúc 11:00)
    // -------------------------------------------------------------------------
    {
      id: 'conv-12',
      name: 'Duy Bida 88',
      phoneNumber: '0916.334.556',
      avatarColor: 'from-[#0A84FF] to-[#64D2FF]',
      timestamp: '20/07 • 11:00',
      previewText: 'Dạo này đang bận mấy vụ gom tiền, để cuối tuần.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm12-1',
          sender: 'Duy Bida 88',
          role: 'received',
          text: 'Chiều nay rảnh qua CLB làm độ bida lỗ 500k/ván với thằng Nam không anh Khang?',
          timestamp: '05/07 • 14:30'
        },
        {
          id: 'm12-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Chiều bận, tối 8h tao qua.',
          timestamp: '05/07 • 14:45',
          status: 'Đã gửi • 14:45'
        },
        {
          id: 'm12-3',
          sender: 'Duy Bida 88',
          role: 'received',
          text: 'Bàn số 1 vừa thay nỉ nhập khẩu mới mượt lắm anh ơi, tối rảnh qua test bàn.',
          timestamp: '18/07 • 19:20'
        },
        {
          id: 'm12-4',
          sender: 'Khang',
          role: 'sent',
          text: 'Dạo này đang bận mấy vụ gom tiền, để cuối tuần.',
          timestamp: '20/07 • 11:00',
          status: 'Đã gửi • 11:00'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 13: 195 (Tổng Đài Nạp Tiền — Tin cuối: 20/07 lúc 09:15)
    // -------------------------------------------------------------------------
    {
      id: 'conv-13',
      name: '195',
      phoneNumber: '195',
      avatarColor: 'from-[#FF9500] to-[#FF2D55]',
      timestamp: '20/07 • 09:15',
      previewText: 'Tai khoan cua Quy khach da duoc cong 500.000d tu the cao...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm13-1',
          sender: '195',
          role: 'received',
          text: 'Tai khoan cua Quy khach da duoc cong 500.000d tu the cao nap ngay 20/07/2016. So du hien tai: 584.250d. Thoi han su dung den 30/12/2016.',
          timestamp: '20/07 • 09:15'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 14: Thắng Sửa Xe (Đã lưu danh bạ — Tin cuối: 18/07 lúc 14:00)
    // -------------------------------------------------------------------------
    {
      id: 'conv-14',
      name: 'Thắng Sửa Xe',
      phoneNumber: '0977.112.445',
      avatarColor: 'from-[#636366] to-[#48484A]',
      timestamp: '18/07 • 14:00',
      previewText: 'Xe SH của anh thay dầu với làm nồi xong rồi nhé, tổng hết 850k...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm14-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Con SH của anh dạo này đi nồi kêu rè rè với phanh trước bị bó, chiều anh vứt qua xưởng chú coi hộ.',
          timestamp: '14/07 • 10:00',
          status: 'Đã gửi • 10:00'
        },
        {
          id: 'm14-2',
          sender: 'Thắng Sửa Xe',
          role: 'received',
          text: 'Vâng anh cứ vứt qua xưởng để em kiểm tra kỹ cho.',
          timestamp: '14/07 • 10:15'
        },
        {
          id: 'm14-3',
          sender: 'Thắng Sửa Xe',
          role: 'received',
          text: 'Anh Khang ơi tháo ra thấy mòn hết bố ba càng với bi nồi rồi, em thay luôn bộ mới xịn của Honda nhé? Tổng tầm hơn triệu.',
          timestamp: '16/07 • 15:30'
        },
        {
          id: 'm14-4',
          sender: 'Khang',
          role: 'sent',
          text: 'Ừ thay luôn đồ ngon cho anh.',
          timestamp: '18/07 • 09:10',
          status: 'Đã gửi • 09:10'
        },
        {
          id: 'm14-5',
          sender: 'Thắng Sửa Xe',
          role: 'received',
          text: 'Xe SH của anh thay dầu với làm nồi xong rồi nhé, tổng hết 850k anh nhé. Chiều rảnh ghé lấy.',
          timestamp: '18/07 • 14:00'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 15: Quân Lô Đề (Đã lưu danh bạ — Tin cuối: 17/07 lúc 10:45)
    // -------------------------------------------------------------------------
    {
      id: 'conv-15',
      name: 'Quân Lô Đề',
      phoneNumber: '0982.441.667',
      avatarColor: 'from-[#30D158] to-[#0A84FF]',
      timestamp: '17/07 • 10:45',
      previewText: 'Em vừa chuyển rồi đó anh, check tk hộ em nhé.',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm15-1',
          sender: 'Khang',
          role: 'sent',
          text: 'Vào cho tao cặp 68 - 86 mỗi con 500 điểm lô, đề đít 8 năm trăm nghìn.',
          timestamp: '16/07 • 16:45',
          status: 'Đã gửi • 16:45'
        },
        {
          id: 'm15-2',
          sender: 'Quân Lô Đề',
          role: 'received',
          text: 'Đã nhận đủ bảng của anh Khang nhé. Chúc anh rực rỡ!',
          timestamp: '16/07 • 17:00'
        },
        {
          id: 'm15-3',
          sender: 'Quân Lô Đề',
          role: 'received',
          text: 'Nổ 68 hai nháy anh ơiii!! Tổng ăn 80 củ, trừ gốc còn lời 62 củ. Mai anh lấy tiền mặt hay bắn tài khoản?',
          timestamp: '16/07 • 18:35'
        },
        {
          id: 'm15-4',
          sender: 'Khang',
          role: 'sent',
          text: 'Chuyển thẳng vào thẻ Vietcombank cho tao.',
          timestamp: '17/07 • 10:20',
          status: 'Đã gửi • 10:20'
        },
        {
          id: 'm15-5',
          sender: 'Quân Lô Đề',
          role: 'received',
          text: 'Em vừa chuyển rồi đó anh, check tk hộ em nhé.',
          timestamp: '17/07 • 10:45'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // THREAD 16: Thím Tư (Đã lưu danh bạ — Tin cuối: 15/07 lúc 16:20)
    // -------------------------------------------------------------------------
    {
      id: 'conv-16',
      name: 'Thím Tư',
      phoneNumber: '0964.881.332',
      avatarColor: 'from-[#AF52DE] to-[#5856D6]',
      timestamp: '15/07 • 16:20',
      previewText: 'Cuối tháng giỗ ông nội ở quê cháu có sắp xếp về được không Khang?...',
      recoveryProgress: 100,
      unread: false,
      messages: [
        {
          id: 'm16-1',
          sender: 'Thím Tư',
          role: 'received',
          text: 'Khang ơi ở quê chú thím vừa gửi buồng chuối ngự với bao gạo nếp lên xe khách Mỹ Đình, trưa cháu ra bến đón lấy nhé.',
          timestamp: '02/07 • 08:30'
        },
        {
          id: 'm16-2',
          sender: 'Khang',
          role: 'sent',
          text: 'Cháu bận không đi được đâu, thím bảo phụ xe gọi xe ôm ship tận nhà cho cháu, cháu trả tiền ship.',
          timestamp: '03/07 • 09:15',
          status: 'Đã gửi • 09:15'
        },
        {
          id: 'm16-3',
          sender: 'Thím Tư',
          role: 'received',
          text: 'Cuối tháng giỗ ông nội ở quê cháu có sắp xếp về được không Khang? Cả họ ai cũng hỏi thăm.',
          timestamp: '15/07 • 16:20'
        }
      ]
    }
  ]
}
