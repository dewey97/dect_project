# 🔊 MASTER AUDIO CATALOG & SOUND DESIGN SPECIFICATIONS
## CHUYÊN ÁN #000: TRỐN TÌM (CASE #000: HIDE-AND-SEEK)

> **Mục đích tài liệu:** Quản lý toàn bộ hệ thống hiệu ứng âm thanh (SFX), nhạc nền (BGM), tiếng động hiện trường (Foley/Atmosphere) và file âm thanh gốc trong Chuyên án #000.  
> **Vị trí lưu trữ tập trung (Source):** Toàn bộ file âm thanh gốc vụ án được lưu trữ tập trung tại `docs/cases/case_000/05_audio/`.  
> **Vị trí xuất bản Web (Runtime):** Các file âm thanh phục vụ chạy ứng dụng web được đồng bộ sang `public/audio/` và `public/audio/sfx/`.  
> **Đồng bộ hệ thống:** Kết nối trực tiếp với trình quản lý âm thanh code frontend tại [`lib/investigation-audio.ts`](file:///d:/code_world/dect_project/lib/investigation-audio.ts) và kịch bản vụ án tại [`docs/cases/case_000/01_design/gameplay_design.md`](file:///d:/code_world/dect_project/docs/cases/case_000/01_design/gameplay_design.md).

---

## 🚨 QUY TẮC QUẢN LÝ & TIÊU CHUẨN ÂM THANH (MASTER AUDIO RULES)

1. **QUẢN LÝ LƯU TRỮ TẬP TRUNG:**
   * Mọi file âm thanh thô, hiệu ứng gốc, bản thu âm thử nghiệm phải được thu gom và lưu tại `docs/cases/case_000/05_audio/`.
   * Tránh tuyệt đối việc để các file `.mp3`, `.wav`, `.ogg` nằm rải rác ở thư mục gốc project.
2. **CHUẨN TỐI ƯU HÓA CHO WEB APP:**
   * Các file audio dùng cho runtime trên Web App phải sử dụng định dạng `.mp3` hoặc `.ogg` được nén tối ưu (bitrate 128kbps - 192kbps) để giảm dung lượng tải trang.
   * Tất cả SFX hiệu ứng tương tác phải đặt trong `public/audio/sfx/`.
3. **ĐỒNG BỘ NARRATIVE & ATMOSPHERE:**
   * Âm thanh phải phản ánh chân thực không khí trinh thám u uất của vụ án năm 2016 tại Hà Nội (tiếng mưa đêm, tiếng còi tàu hỏa tuyến đường sắt ven sông, tiếng cửa gỗ lim rên xiết, tiếng vỡ của gốm sứ men lam).

---

## 🧭 MỤC LỤC DANH MỤC ÂM THANH

1. [I. DANH MỤC FILE GỐC (RAW AUDIO ASSETS) — `docs/cases/case_000/05_audio/`](#i-danh-mục-file-gốc-raw-audio-assets--docscasescase_00005_audio)
2. [II. DANH MỤC ÂM THANH RUNTIME (PRODUCTION WEB SFX) — `public/audio/`](#ii-danh-mục-âm-thanh-runtime-production-web-sfx--publicaudio)
3. [III. MÃ NGUỒN QUẢN LÝ ÂM THANH (`lib/investigation-audio.ts`)](#iii-mã-nguồn-quản-lý-âm-thanh-libinvestigation-audiots)

---

## I. DANH MỤC FILE GỐC (RAW AUDIO ASSETS) — `docs/cases/case_000/05_audio/`

Dưới đây là bảng tổng hợp các file âm thanh gốc đã được dọn dẹp và đưa vào thư mục lưu trữ tập trung `05_audio`:

| Tên Tệp Tin | Định Dạng | Dung Lượng | Mô Tả Nghiệp Vụ & Công Dụng |
| :--- | :---: | :---: | :--- |
| `atmosphere_drone.wav` | WAV | 1.41 MB | Nhạc nền không khí rùng rợn u uất (Ambient drone soundscape) dùng cho phân cảnh khám xét hiện trường ban đêm. |
| `final_climax.wav` | WAV | 1.35 MB | Nhạc nền cao trào (Climax BGM) kích hoạt ở Giai đoạn 3 khi lật tẩy thủ phạm Trần Thị Hà. |
| `tiktok_source.wav` | WAV | 9.16 MB | File âm thanh gốc/nguồn thu âm thoại và hiệu ứng dòng sự kiện. |
| `great_hall_slam.wav` | WAV | 10.69 MB | Tiếng sập cửa lớn có độ vang (Great hall door slam). |
| `great_hall_cut.wav` | WAV | 672 KB | Trích đoạn ngắn của tiếng sập cửa lớn. |
| `doorslam_archive.mp3` | MP3 | 27 KB | Tiếng đóng sập cửa tư liệu (Archive door slam). |
| `Closing_an_old_door.ogg` | OGG | 82 KB | Tiếng đóng cửa gỗ cũ kỹ. |
| `Rusty_metal_door_clasp_02.ogg`| OGG | 691 KB | Tiếng chốt cửa sắt/chốt khóa cổ bị gỉ sét (`Rusty metal clasp`). |
| `springlocked_door.ogg` | OGG | 555 KB | Tiếng khóa cửa lò xo / chốt bẫy tủ gỗ. |
| `Squeaky_door_hinge.ogg` | OGG | 129 KB | Tiếng bản lề cửa gỗ rên xiết kẽo kẹt. |
| `real_creak.wav` | WAV | 387 KB | Tiếng tiếng gỗ kêu kẽo kẹt thực tế. |
| `real_latch.wav` | WAV | 211 KB | Tiếng bẩy chốt khóa thực tế. |
| `real_slam.wav` | WAV | 114 KB | Tiếng va đập sập cửa thực tế. |
| `super_slam.wav` | WAV | 282 KB | Tiếng va đập mạnh dồn dập. |
| `slam_preview.wav` | WAV | 441 KB | File nghe thử hiệu ứng va đập 1. |
| `slam_preview2.wav` | WAV | 350 KB | File nghe thử hiệu ứng va đập 2. |
| `part_0_6.wav` | WAV | 1.05 MB | Trích đoạn âm thanh thành phần 0_6. |
| `test_ssml.mp3` | MP3 | 0 KB | File test cấu hình SSML giọng đọc. |
| `Voice Vy.mp3` | MP3 | 60 KB | Ghi âm tin nhắn thoại Thảo Vy gửi Khang lúc 20:38 ngày 24/07 (thời lượng 0:04). |
| `Voice Khang.mp3` | MP3 | 93 KB | Ghi âm tin nhắn thoại Đặng Hoàng Khang đe dọa đòi nợ gửi Tuấn Béo lúc 10:20 ngày 21/07 (thời lượng 0:06). |

---

## II. DANH MỤC ÂM THANH RUNTIME (PRODUCTION WEB SFX) — `public/audio/`

Các file âm thanh trực tiếp kết nối với giao diện người dùng và cơ chế chơi (Gameplay):

### 1. Hiệu ứng tương tác SFX (`public/audio/sfx/`)

* **`ceramic_shatter.mp3`**: Tiếng vỡ xoảng của bình trà gốm sứ men lam (Hung khí `p3`).
* **`train_horn.mp3`**: Tiếng còi tàu hỏa diesel & chuông gác chắn đường sắt ven sông (Bối cảnh đường Bờ Sông).
* **`heartbeat.mp3`**: Tiếng nhịp tim đập dồn dập khi mở khóa giai đoạn điều tra mới / phát hiện tình tiết nguy hiểm.
* **`stamp.mp3`**: Tiếng đóng dấu niêm phong đỏ khi trả lời đúng mốc đối soát đứt gãy suy luận (Checkpoint).
* **`unlock_jingle.mp3`**: Tiếng nhạc jingle âm vang khi hoàn thành giải đố thành công.
* **`glass_break.mp3`**: Tiếng thủy tinh rạn nứt / cảnh báo khi chọn sai lập luận.
* **`paper_rustle.mp3`**: Tiếng sột soạt lật hồ sơ, tài liệu, biên bản khai nại.
* **`ha_voicemail_2032_v4.mp3`**: Lời nhắn hộp thư thoại 20:32 của Trần Thị Hà gửi nạn nhân Khang (chứa âm thanh đầu mối: còi tàu hỏa 68dB vạch trần cô ta đang đứng ngay trước cổng nhà nạn nhân).
* **`ha_interrogation_breakdown.mp3`**: Băng ghi âm thẩm vấn năm 2016 (lời khai gay gắt, dồn ép và vỡ vụn tâm lý của Trần Thị Hà khi bị chất vấn về việc nhầm lịch phát sóng VTV3).
* **`voice_vy.mp3`**: Tin nhắn thoại Thảo Vy gửi Khang trong luồng chat iPhone (`m1-25`, thời lượng 0:04).
* **`voice_khang.mp3`**: Tin nhắn thoại Khang gửi Tuấn Béo Xưởng Mộc trong luồng chat iPhone (`m9-7`, thời lượng 0:06).

### 2. Nhạc nền cao trào (`public/audio/`)

* **`hide_and_seek_climax.mp3`**: Nhạc nền climax chính thức của Chuyên án #000, tạo cảm giác dồn dập, căng thẳng trong khoảnh khắc đối chất phá án.

---

## III. MÃ NGUỒN QUẢN LÝ ÂM THANH (`lib/investigation-audio.ts`)

Hệ thống sử dụng class singleton `detectiveAudio` hỗ trợ cache sound effect và phát đè âm thanh (overlapping playback):

```typescript
// Ví dụ gọi hiệu ứng âm thanh trong ứng dụng:
import { detectiveAudio } from '@/lib/investigation-audio'

// Tiếng vỡ bình trà khi kiểm tra hung khí p3
detectiveAudio.playCeramicShatterSound()

// Tiếng còi tàu khi xem hotspot cửa sổ
detectiveAudio.playTrainHornAndBellSound()

// Tiếng đóng dấu khi vượt qua checkpoint suy luận
detectiveAudio.playStampSound()
```

---

## IV. DETECTIVE AUDIO MCP SERVER (`scripts/audio_mcp_server.py`)

Hệ thống đã tích hợp **MCP Server cục bộ (`detective_audio`)** được khai báo tại `C:\Users\Dell\.gemini\config\mcp_config.json`.

### Các công cụ (Tools) tích hợp:
1. `generate_investigation_voice`: Sinh giọng thoại nhân chứng / nghi phạm / trẻ em tiếng Việt có áp dụng bộ lọc vật lý (điện thoại 113, băng cassette thẩm vấn, bộ đàm cảnh sát, buồng tủ gỗ).
2. `apply_acoustic_filter`: Áp dụng giả lập âm học căn phòng / thiết bị lên file âm thanh sẵn có.
3. `mix_scene_soundscape`: Hòa trộn hành động (thoại / SFX) với nhạc nền drone u ám (`atmosphere_drone.wav`).
4. `list_case_audio_assets`: Kiểm kê tự động toàn bộ file audio ở cả runtime và source archive kèm thời lượng, dung lượng.

