# 📸 MASTER PHOTO CATALOG & AI GENERATION PROMPT SYSTEM (ULTIMATE EDITION)
## CHUYÊN ÁN #000: TRỐN TÌM (CASE #000: HIDE-AND-SEEK)

> **Mục đích tài liệu:** Quản lý toàn bộ hệ thống hình ảnh vật chứng hiện trường, ảnh chụp màn hình thiết bị và ảnh chân dung nhân vật trong Chuyên án #000.  
> **Đồng bộ tuyệt đối:** Đồng bộ 100% với [`docs/cases/case_000/01_design/evidence_matrix.md`](file:///d:/code_world/dect_project/docs/cases/case_000/01_design/evidence_matrix.md) và [`docs/cases/case_000/01_design/gameplay_design.md`](file:///d:/code_world/dect_project/docs/cases/case_000/01_design/gameplay_design.md).  
> **Hệ Thống Prompt "Bulletproof" Chống Lỗi Tuyệt Đối:** Được thiết kế chuyên biệt cho **Midjourney v6**, **Flux.1 Pro**, **Stable Diffusion 3**, **DALL-E 3** với cấu trúc đa tầng:
> 1. Neo nhân trắc học & sắc tộc thuần Việt (Kinh Vietnamese Ethnicity Anchor).
> 2. Phân lập giải phẫu chi tiết (tách biệt mắt trái/phải, vị trí sẹo, mật độ nếp nhăn, góc lệch con ngươi).
> 3. Kiểm soát quang học & góc chụp (Lens focal length, aperture f/2.8 tránh out-net dị tật, lighting ratio, shadow falloff).
> 4. Bộ Negative Prompt chuyên sâu chặn đứng hiện tượng "AI hallucination" (chặn lác cả 2 mắt, chặn sẹo lệch chỗ, chặn mặt Tây hóa).

---

## 🧭 MỤC LỤC DANH MỤC HÌNH ẢNH

1. [I. DANH MỤC ẢNH CHÂN DUNG NHÂN VẬT (PORTRAIT AVATARS)](#i-danh-mục-ảnh-chân-dung-nhân-vật-portrait-avatars)
   - [`avatar_khang` — NGUYỄN VĂN KHANG (NẠN NHÂN — 38 TUỔI)](#1-avatar_khang-nguyễn-văn-khang-nạn-nhân-38-tuổi)
   - [`avatar_mai` — NGUYỄN NGỌC MAI (NGHI PHẠM 1 — 34 TUỔI)](#2-avatar_mai-trần-ngọc-mai-nghi-phạm-1-34-tuổi)
   - [`avatar_vu` (`p6`) — LÊ QUANG VŨ (NGHI PHẠM 2 — 35 TUỔI — MẮT TRÁI LÁC NHẸ)](#3-avatar_vu-p6-lê-quang-vũ-nghi-phạm-2-35-tuổi-mắt-trái-lác-nhẹ)
   - [`avatar_tung` — NGUYỄN THANH TÙNG (NGHI PHẠM 3 — 40 TUỔI — SẸO CHỮ V)](#4-avatar_tung-nguyễn-thanh-tùng-nghi-phạm-3-40-tuổi-sẹo-chữ-v)
   - [`avatar_ha` — TRẦN THỊ HÀ (THỦ PHẠM CHÍNH — 36 TUỔI — CUỒNG YÊU ÁM ẢNH)](#5-avatar_ha-trần-thị-hà-thủ-phạm-chính-36-tuổi-cuồng-yêu-ám-ảnh)
   - [`avatar_lua` — BÀ NGUYỄN THỊ LỤA (NHÂN CHỨNG HÀNG XÓM — 60 TUỔI)](#6-avatar_lua-bà-nguyễn-thị-lụa-nhân-chứng-hàng-xóm-60-tuổi)
   - [`avatar_dat` — TRẦN VĂN ĐẠT / ĐẠT GÀ (CHỢ CẢNG — 38 TUỔI)](#7-avatar_dat-trần-văn-đạt-đạt-gà-chợ-cảng-38-tuổi)
   - [`avatar_vy` — THẢO VY / BÉ VY ❤️ (NHÂN TÌNH NẠN NHÂN — 24 TUỔI)](#8-avatar_vy-thảo-vy-bé-vy-nhân-tình-nạn-nhân-24-tuổi)
   - [`avatar_huy` — BÉ NGUYỄN GIA HUY (EM TRAI TÙNG — 7 TUỔI, HÈ 1996)](#9-avatar_huy-bé-nguyễn-gia-huy-em-trai-tùng-7-tuổi-hè-1996)
2. [II. DANH MỤC ẢNH HIỆN TRƯỜNG & TƯ LIỆU VẬT CHỨNG (`p1` – `p5`)](#ii-danh-mục-ảnh-hiện-trường-tư-liệu-vật-chứng-p1-p5)
   - [`p1` — HIỆN TRƯỜNG & TÁCH TRÀ PHÒNG KHÁCH (`photo-crime-scene-overview.jpg`)](#1-p1-hiện-trường-tách-trà-phòng-khách-photo-crime-scene-overviewjpg)
   - [`p2` — ĐƠN ĐÒI ĐẤT 200M² RƠI VÃI DƯỚI SÀN (`photo-scattered-documents.jpg`)](#2-p2-đơn-đòi-đất-200m²-rơi-vãi-dưới-sàn-photo-scattered-documentsjpg)
   - [`p3` — MẢNH BÌNH TRÀ VỠ DÍNH MÁU — HUNG KHÍ (`photo-glass-shard-detail.jpg`)](#3-p3-mảnh-bình-trà-vỡ-dính-máu-hung-khí-photo-glass-shard-detailjpg)
   - [`p4` — ẢNH KỶ NIỆM XÓM BỜ SÔNG HÈ 1996 (`photo-childhood-group.jpg`)](#4-p4-ảnh-kỷ-niệm-xóm-bờ-sông-hè-1996-photo-childhood-groupjpg)
   - [`p5` — MẢNH BÁO CŨ 1996 XÉ VỤN GHÉP LẠI (`photo-old-newspaper.jpg`)](#5-p5-mảnh-báo-cũ-1996-xé-vụn-ghép-lại-photo-old-newspaperjpg)
3. [III. DANH MỤC ẢNH CHỤP MÀN HÌNH THIẾT BỊ (DEVICE SCREENSHOTS)](#iii-danh-mục-ảnh-chụp-màn-hình-thiết-bị-device-screenshots)
   - [`p10` — SCREENSHOT LỊCH SỬ APP ĐẶT XE CỦA LÊ QUANG VŨ (`screenshot-ride-app-vu.png`)](#1-p10-screenshot-lịch-sử-app-đặt-xe-của-lê-quang-vũ-screenshot-ride-app-vupng)
4. [IV. HƯỚNG DẪN TẠO ẢNH CHỐNG LỖI (ANTI-FAIL WORKFLOW)](#iv-hướng-dẫn-tạo-ảnh-chống-lỗi-anti-fail-workflow)

---

## I. DANH MỤC ẢNH CHÂN DUNG NHÂN VẬT (PORTRAIT AVATARS)

---

### 1. `avatar_khang` — NGUYỄN VĂN KHANG (NẠN NHÂN — 38 TUỔI)
* **Tệp tin lưu trữ:** `avatar_khang.jpg` / `profile-khang.png`
* **Mục đích nghiệp vụ:** Ảnh căn cước / ảnh hồ sơ trinh sát nhận diện nạn nhân chủ nợ tín dụng đen bị sát hại.
* **Mô tả giải phẫu & nhân trắc học (Vietnamese Technical Spec):**
  - Nam giới 38 tuổi, người Kinh thuần túy, tạng người to bè (endomorph), chiều cao khoảng 1m75.
  - Khuôn mặt vuông chữ điền thô ráp, quai hàm bạnh sang hai bên, ngấn cằm dày.
  - Lông mày rậm xếch ngược dữ tợn, mắt mí lót nhìn xéo trơ tráo, khóe miệng nhếch lên thành nụ cười khinh khỉnh ngạo mạn.
  - Râu quai nón lởm chởm màu xanh đen vừa nhú sau 2 ngày chưa cạo.
  - Cánh tay phải cơ bắp để lộ hình xăm mực tàu xanh đen hình Rồng thời Nguyễn uốn lượn từ bắp tay xuống cổ tay. Cổ áo polo dão màu xám đen để lộ sợi dây chuyền bạc 925 to bản dạng mắt xích.
* **Thiết lập góc máy & ánh sáng:** Chụp ngang tầm mắt, cự ly 1.5 mét, phông nền tường bê tông phòng thẩm vấn có vạch đo chiều cao mờ phía sau. Đèn key light xiên 45 độ tạo bóng đổ góc cạnh gồ ghề.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO):**
```text
Official police criminal identification dossier photograph of an arrogant 38-year-old Kinh Vietnamese man named Nguyen Van Khang, local loan shark. Heavy broad square jawline, thick thickset neck, masculine East Asian facial structure, high broad cheekbones. Intense intimidating dark eyes with a slight cynical upward smirk on chapped lips, dark coarse 2-day stubble along the jaw. Messy short black hair combed back with pomade. On his right forearm, an intricate traditional black-and-grey Vietnamese dragon tattoo with visible scales and sharp claws is clearly visible. Thick chunky silver link chain necklace resting on his chest inside an open-collar faded charcoal grey polo shirt. Authentic Vietnamese criminal mugshot aesthetic, raw gritty skin texture with visible enlarged pores, oily sheen, and minor acne scars. Neutral off-white police station wall with faint height measurement lines in background. Harsh low-key directional lighting from upper left, Hasselblad H6D-100c, 85mm f/2.8 lens for full facial sharpness, documentary realism, 8k resolution, raw photo. --ar 1:1 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI):**
```text
(caucasian:1.3), western face, smooth airbrushed skin, anime, 3d render, cartoon, smiling warmly, friendly, weak jaw, bald, thin eyebrows, blurry eyes, oversaturated, symmetrical lighting, clean neat studio portrait.
```

---

### 2. `avatar_mai` — NGUYỄN NGỌC MAI (NGHI PHẠM 1 — 34 TUỔI)
* **Tệp tin lưu trữ:** `avatar_mai.jpg` / `profile-mai.png`
* **Mục đích nghiệp vụ:** Hồ sơ điều tra nghi phạm tranh chấp di sản đất đai 200m², nhân viên công sở đĩnh đạc.
* **Mô tả giải phẫu & nhân trắc học (Vietnamese Technical Spec):**
  - Nữ giới 34 tuổi, người Kinh miền Bắc, vóc dáng thanh mảnh cao 1m62, phong thái đĩnh đạc, cương trực.
  - Khuôn mặt trái xoan thanh tú, sống mũi cao thon tự nhiên (không phẫu thuật), bờ môi mỏng mím chặt kiên định biểu hiện sự bực bội kìm nén.
  - Đôi mắt đen láy sắc sảo, hai mí rõ nét, quầng mắt hơi thâm nhẹ do mất ngủ nhiều đêm lo lắng chuyện đất đai.
  - Mái tóc đen tuyền tự nhiên óng ả được chải mượt buộc gọn kiểu đuôi ngựa thấp phía sau gáy, để lộ đôi tai đeo khuyên nụ bạc tròn 3mm tối giản.
  - Trang phục công sở: Áo sơ mi lụa màu trắng kem cài kín cổ đức, khoác ngoài áo vest blazer màu be cát vải linen phẳng phiu.
* **Thiết lập góc máy & ánh sáng:** Chụp cận cảnh chân dung góc 3/4, ánh sáng tự nhiên từ cửa sổ chiếu vào gương mặt, thể hiện sự chính trực và tự tôn gia tộc.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO):**
```text
Cinematic investigation interview portrait of a 34-year-old Northern Vietnamese corporate woman named Tran Ngoc Mai. Refined oval East Asian facial structure, smooth fair-olive complexion with natural subtle skin texture and faint realistic tired under-eye shadows. Expressive, piercing dark brown almond-shaped eyes filled with stubborn pride and righteous anger, thin lips firmly pressed together in determination. Her straight natural black hair is pulled back into a neat, elegant low ponytail. Wearing minimalist small round 3mm silver stud earrings, a pristine ivory-white silk buttoned collared blouse under a structured beige linen blazer. Authentic Vietnamese police interrogation room setting, soft diffused window light from the side revealing delicate micro-expressions of pride and suppressed grief, neutral blurred wooden office partition in background. Shot on Sony A7R V with 85mm f/1.8 GM lens, tack-sharp focus on iris and eyelashes, subtle film noir color grade, hyper-realistic, 8k resolution. --ar 1:1 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI):**
```text
(caucasian:1.3), blonde hair, dyed hair, heavy glamour makeup, false eyelashes, plastic surgery look, smiling, happy, seductive, messy hair, anime, 3d render, doll skin, oversaturated, blurry.
```

---

### 3. `avatar_vu` (`p6`) — LÊ QUANG VŨ (NGHI PHẠM 2 — 35 TUỔI — MẮT TRÁI LÁC NHẸ)
* **Tệp tin lưu trữ:** `avatar_vu.jpg` / `profile-vu.png` (`p6`)
* **Mục đích nghiệp vụ:** Nhận diện đối tượng *"Thằng Lệch Pha"* nợ 300 triệu; **VẬT CHỨNG NHẬN DẠNG CỐT LÕI KHÔNG ĐƯỢC PHÉP LỖI**.
* **Mô tả giải phẫu & nhân trắc học (Vietnamese Technical Spec — CỰC KỲ CHI TIẾT):**
  - Nam giới 35 tuổi, người Kinh, thể trạng gầy gò, má hơi hóp, cằm lẹm nhẹ, da mặt vàng vọt xỉn màu vì thiếu ngủ và áp lực trốn nợ.
  - **ĐẶC TẢ KHUYẾT TẬT MẮT (CHỐNG LỖI AI TUYỆT ĐỐI):**
    - Đeo kính cận gọng vuông màu đen chất liệu nhựa acetate mỏng.
    - **Mắt phải (bình thường):** Đồng tử và con ngươi màu nâu đen nhìn thẳng 100% vào ống kính máy ảnh.
    - **Mắt trái (bị lác nhẹ):** Bị tật lác ngoài nhẹ (Mild Exotropia / Outward Strabismus), **con ngươi mắt trái lệch nhẹ ra góc ngoài khoảng 12 độ** so với trục nhìn thẳng. Hai mắt bất đối xứng góc nhìn một cách tự nhiên và chân thật, không bị biến dạng quái dị.
  - Biểu cảm: Toát mồ hôi hột li ti ở vùng trán và thái dương, quai hàm cắn chặt hơi run, ánh mắt lấm lét, sợ sệt, khúm núm của kẻ ở rể bị dồn vào chân tường.
  - Trang phục: Áo sơ mi kẻ sọc caro vuông màu xanh navy và xám trắng hơi nhàu, cổ áo bẻ lệch, có cài chiếc bút bi kỹ thuật vỏ nhựa xanh ở túi ngực trái.
* **Thiết lập góc máy & ánh sáng:** Khẩu độ phải đặt ở **f/2.8** (không dùng f/1.2 hay f/1.4 để tránh làm mờ con ngươi mắt trái). Ánh sáng đèn tuýp huỳnh quang phía trên phản chiếu một vệt sáng nhẹ trên tròng kính.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO):**
```text
Ultra-detailed forensic identification portrait of a 35-year-old Vietnamese freelance electrical technician named Le Quang Vu. Lean, anxious face with slightly hollow cheeks, pale sallow skin tone, heavy dark purple eye bags from chronic stress and panic. CRITICAL ANATOMICAL FEATURE - STRABISMUS EYE DEFECT: He wears thin black rectangular acetate eyeglasses; his RIGHT EYE looks directly forward into the camera lens with a dark brown pupil, while his LEFT EYE HAS A CLEAR DISTINCT OUTWARD DRIFT (mild lateral strabismus / exotropia, left pupil angled approximately 12 degrees outwards toward the temple). Highly realistic, natural asymmetric eye alignment. Nervous beads of perspiration along his temples, tight trembling jaw, intimidated guilty expression. Dressed in a rumpled casual navy-blue and grey plaid short-sleeve button-up shirt with an electrician plastic click-pen in his left chest pocket. Authentic Vietnamese interrogation desk environment, cool fluorescent overhead lighting creating realistic subtle reflections on the lens rims. Shot on Canon EOS R5 with 85mm f/2.8 macro lens for full depth of field across both eyes, razor-sharp focus on pupils, authentic micro-pores and sweat glisten, realistic noir documentary photography, 8k resolution. --ar 1:1 --style raw --s 60 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI — CHẶN LỖI MẮT):**
```text
(bilateral crossed eyes:1.4), (both eyes crossed:1.4), severe disfigurement, monstrous eyes, missing glasses, round glasses, wireframe glasses, completely symmetrical eyes, happy smiling expression, confident, athletic, muscular, caucasian, anime, 3d CGI, blurred eyes.
```

---

### 4. `avatar_tung` — NGUYỄN THANH TÙNG (NGHI PHẠM 3 — 40 TUỔI — SẸO CHỮ V)
* **Tệp tin lưu trữ:** `avatar_tung.jpg` / `profile-tung.png`
* **Mục đích nghiệp vụ:** Nhận diện anh trai bé Gia Huy; đối chiếu vết sẹo chữ V với ảnh kỷ niệm hè 1996 (`p4`).
* **Mô tả giải phẫu & nhân trắc học (Vietnamese Technical Spec — CỰC KỲ CHI TIẾT):**
  - Nam giới 40 tuổi, người Kinh, thợ nề lao động tự do, vóc người rắn rỏi, gân guốc, da ngăm đen rám nắng gió đặc trưng.
  - Khuôn mặt chữ điền khắc khổ, nhiều nếp nhăn sâu khắc khoải ở khóe mắt và trán.
  - **ĐẶC TẢ VẾT SẸO CỐT LÕI (CHỐNG LỖI AI TUYỆT ĐỐI):**
    - Tại **đuôi lông mày bên trái**, có một **vết sẹo cũ màu trắng ngà hình chữ "V" dài khoảng 1.5 cm**, vết sẹo làm đứt gãy hàng lông mày đen rậm (hairless scar line running through the outer tail of left eyebrow).
    - Tại **gò má bên phải**, có một **vết bầm tụ máu cơ học mới màu tím sẫm lẫn ánh đỏ** (đường kính 2.5 cm) do cú đấm xô xát tối qua.
  - Ánh mắt: Trĩu nặng u uất, đau đớn, hốc mắt thâm quầng, ánh nhìn chứa đựng 30 năm dằn vặt khôn nguôi vì cái chết của đứa em tật nguyền.
  - Tóc đen rễ tre cắt ngắn lấm tấm vài sợi bạc ở thái dương. Mặc áo phông cotton cổ tròn màu xanh rêu bạc màu, sờn mép cổ, vương vài hạt bụi vôi vữa trắng mờ.
* **Thiết lập góc máy & ánh sáng:** Chụp cận mặt góc chính diện, ánh sáng chiaroscuro tương phản cao tôn lên từng nếp nhăn và vết sẹo.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO):**
```text
Intense gritty character portrait of a 40-year-old Vietnamese construction mason named Nguyen Thanh Tung, a broken man carrying 30 years of guilt. Weathered sunburnt bronze complexion, rugged square jawline, deep sorrowful wrinkles around the eyes and forehead. CRITICAL IDENTIFYING MARKS: High on the outer tail of his LEFT EYEBROW is a PROMINENT OLD PALE-WHITE V-SHAPED SCAR (1.5cm long) causing a clean vertical gap in his thick black eyebrow hair. On his RIGHT CHEEKBONE is a fresh deep-purple and dark-red contusion bruise from a recent fight. His dark hollow eyes are filled with agonizing grief, haunted trauma, and unshed tears. Coarse short black crew-cut hair with realistic salt-and-pepper grey hairs around the ears. Wearing a faded, distressed army-green cotton work crewneck t-shirt with minor powdery white cement dust smudges on the shoulders. Cinematic high-contrast side lighting (chiaroscuro), deep moody shadows, shot on Nikon Z9 with 105mm f/2.5 lens, incredible tactile skin pores and scar texture, raw emotional photojournalism masterpiece, 8k resolution. --ar 1:1 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI — CHẶN LỖI SẸO):**
```text
(scar on wrong side:1.3), scar on right eyebrow, missing scar, smooth flawless skin, clean face, smiling, cheerful, clean fancy clothes, caucasian, female, anime, cartoon, 3d render, oversaturated, symmetrical lighting.
```

---

### 5. `avatar_ha` — TRẦN THỊ HÀ (THỦ PHẠM CHÍNH — 36 TUỔI — CUỒNG YÊU ÁM ẢNH)
* **Tệp tin lưu trữ:** `avatar_ha.jpg` / `profile-ha.png`
* **Mục đích nghiệp vụ:** Chân dung tâm lý tội phạm nữ sát thủ giết người vì cuồng ghen bệnh hoạn.
* **Mô tả giải phẫu & nhân trắc học (Vietnamese Technical Spec — CỰC KỲ CHI TIẾT):**
  - Nữ giới 36 tuổi, người Kinh, tạng người gầy gò, xương quai xanh nhô cao, cổ gầy dài. Nước da trắng bợt, tái nhợt thiếu ánh mặt trời (sickly porcelain pale).
  - Gương mặt thon dài, cằm hơi nhọn, sống mũi thẳng nhưng nhỏ.
  - **ĐẶC TẢ ÁNH MẮT & BIỂU CẢM CUỒNG SI (CHỐNG LỖI AI):**
    - Đôi mắt một mí to tròn (wide unblinking monolid eyes), con ngươi đen giãn to nhìn chằm chằm đầy ám ảnh vào ống kính máy ảnh (chilling obsessive dead-eyed stare).
    - Vành mắt hơi ửng đỏ tấy do khóc nhiều và thức trắng đêm.
    - Khóe môi mỏng màu hồng nhạt hơi nhếch lên thành một nụ cười mỉm lạnh lẽo, vô hồn, toát lên sự giải thoát điên loạn (*"Anh ấy mãi mãi là của tao"*).
  - Tóc đen nhánh dài buông xõa tự nhiên ngang vai, vài sợi tóc lòa xòa dính vào gò má tái nhợt. Mặc áo len cardigan mỏng màu xám nhạt cài kín cúc đến sát cổ họng.
* **Thiết lập góc máy & ánh sáng:** Ánh sáng lạnh tông xanh cyan nhạt (cold blue-green forensic lighting) từ một ô cửa sổ thông gió chiếu chéo, tạo cảm giác rùng mình ngột ngạt.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO):**
```text
Chilling psychological thriller criminal portrait of a 36-year-old Vietnamese female accountant turned obsessive murderer named Tran Thi Ha. Frail slender build, strikingly pale translucent skin with an eerie sickly undertone and prominent collarbones. DISTURBING PSYCHOPATHIC FACIAL EXPRESSION: Wide, unblinking dark monolid eyes staring directly forward with a terrifying mix of fanatical devotion, morbid possessiveness, and cold detachment (obsessive yandere gaze). Faint, eerie tranquil smile lingering on her chapped pale lips. Natural raven-black straight shoulder-length hair falling loosely with a few strands clinging to her pale cheek. Wearing a plain, buttoned-up modest dove-grey knitted cardigan buttoned all the way up to her collarbone. Somber, cold-toned moody ambient lighting with teal-cyan undertones inside a police medical holding cell, dramatic soft shadows, shot on Leica SL2 with 75mm f/1.4 Summilux lens, razor-sharp focus on the glassy reflective pupils, intense psychological realism, 8k resolution. --ar 1:1 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI):**
```text
(caucasian:1.3), blonde hair, double eyelids, cheerful normal smile, warm sunny lighting, glamour photography, heavy makeup, lipstick, anime, 3d CGI, cute, cartoon, distorted fingers, blurry eyes.
```

---

### 6. `avatar_lua` — BÀ NGUYỄN THỊ LỤA (NHÂN CHỨNG HÀNG XÓM — 60 TUỔI)
* **Tệp tin lưu trữ:** `avatar_lua.jpg` / `profile-lua.png`
* **Mục đích nghiệp vụ:** Nhân chứng chủ chốt nghe tiếng xe 19:00, tiếng cãi nhau 20:00 và phát hiện thi thể 06:30.
* **Mô tả giải phẫu & nhân trắc học (Vietnamese Technical Spec):**
  - Phụ nữ lớn tuổi 60 tuổi, người Kinh đồng bằng Bắc Bộ truyền thống, gương mặt phúc hậu hiền từ nhưng thần thái đang bàng hoàng, kinh hãi sau khi phát hiện án mạng.
  - Làn da có nhiều đốm đồi mồi tự nhiên và nếp nhăn sâu khóe mắt, khóe miệng.
  - Mái tóc hoa râm (70% sợi bạc) được chải gọn gàng búi tròn truyền thống sau gáy bằng búi lưới đen.
  - **ĐẶC ĐIỂM KÍNH LÃO:** Đeo chiếc kính lão gọng nhựa đồi mồi cổ điển trễ xuống 1/3 sống mũi, ánh mắt mở to quan sát tinh tường nhìn hơi chếch lên trên gọng kính.
  - Mặc bộ đồ mặc nhà bằng vải lanh hoa nhí nền nâu sẫm điểm hoa vàng nhỏ (bộ đồ bà ba/đồ bộ kiểu miền Bắc).
* **Thiết lập góc máy & ánh sáng:** Ánh sáng ban mai tự nhiên trong ngõ Bờ Sông, hậu cảnh là bức tường quét vôi vàng cũ kỹ rêu phong của Hà Nội.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO):**
```text
Authentic documentary portrait of a 60-year-old traditional Northern Vietnamese grandmother named Nguyen Thi Lua, key witness to a murder. Kind, weathered matriarchal East Asian face with genuine age spots and deep crow's feet wrinkles, expressing visible alarm, shock, and lingering horror. Classic salt-and-pepper grey hair neatly swept into a traditional low bun at the back of her head. Vintage brown tortoiseshell reading glasses resting slightly low on the bridge of her nose, her dark observant eyes peering acutely over the rims. Dressed in authentic Vietnamese comfortable short-sleeve floral-printed linen pajamas (traditional do bo with small yellow flowers on brown fabric). Early morning natural daylight filtering down a narrow Hanoi alleyway with aged yellow peeling plaster walls and damp green moss in the blurred background. Shot on Fujifilm GFX 100 II with 63mm f/2.8 lens, exceptional natural skin texture, cultural authenticity, raw documentary journalism style, 8k resolution. --ar 1:1 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI / Fooocus):**
```text
(caucasian:1.3), western woman, smooth skin, plastic surgery, young face, blonde hair, smiling, laughing, cheerful, happy, glamour, heavy makeup, lipstick, modern western clothing, studio background, anime, 3d render, cartoon, blurry eyes, missing glasses, round sunglasses, extra ears, double chin.
```

---

### 7. `avatar_dat` — TRẦN VĂN ĐẠT / ĐẠT GÀ (CHỢ CẢNG — 38 TUỔI)
* **Tệp tin lưu trữ:** `avatar_dat.jpg` / `profile-dat-ga.png`
* **Mục đích nghiệp vụ:** Nghi phạm nợ nần bốc họ 80M, đối tượng nhiễu có ngoại phạm vững chắc tại Chợ Cảng.
* **Mô tả giải phẫu & nhân trắc học (Vietnamese Technical Spec):**
  - Nam giới 38 tuổi, người Kinh, tiểu thương mổ và bán gà sống tại chợ đầu mối. Thể hình thô đậm, cơ bắp cuồn cuộn nhưng nhiều mỡ dạn dày sương gió.
  - Khuôn mặt vuông vức bặm trợn, gò má cao, râu ria lởm chởm quanh cằm. Da mặt nâu đồng bóng nhờn mồ hôi và dầu mỡ.
  - Lông mày rậm nhíu chặt, biểu cảm cáu kỉnh, gắt gỏng, mắt đỏ ngầu do thiếu ngủ dậy từ 3h sáng chở gà.
  - **TRANG PHỤC & ĐẶC ĐIỂM CHỐNG LỖI (ANTI-GLITCH):** Mặc áo thun ba lỗ màu xám ướt đẫm mồ hôi vùng ngực, khoác ngoài chiếc **tạp dề cao su chống thấm nước màu xanh rêu dày cộp, trên bề mặt bám dính vài giọt nước đục và 2-3 chiếc lông gà ướt**. TUYỆT ĐỐI KHÔNG vẽ mũ đầu bếp hay tạp dề trắng nhà hàng.
* **Thiết lập góc máy & ánh sáng:** Ánh sáng bóng đèn tròn sợi đốt vàng ấm pha lẫn hơi nước ẩm ướt trong sạp chợ gia cầm rạng sáng.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO):**
```text
Candid environmental documentary portrait of a 38-year-old rugged Vietnamese wet-market poultry vendor named Tran Van Dat, nicknamed Dat Ga. Burly, stocky muscular build, weathered oily tan skin glistening with sweat, hostile aggressive scowl, thick furrowed black eyebrows, and rough unkempt stubble along his jawline. Irritable bloodshot tired eyes from working 3 AM market shifts. Wearing a stained grey ribbed cotton tank top underneath a heavy-duty dark olive-green waterproof rubber butcher apron, spattered with water droplets and a few wet chicken feathers stuck to the chest. Gritty authentic Hanoi wholesale poultry market stall at dawn, misty humid air with stacked plastic poultry cages softly blurred in background. Warm tungsten overhead hanging bulb mixing with cool morning twilight, shot on Sony A1 with 50mm f/2.8 GM lens for full sharp textural depth, intense raw documentary aesthetic, visceral texture, 8k resolution. --ar 1:1 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI / Fooocus):**
```text
(caucasian:1.3), white chef apron, chef hat, toque, clean clothes, handsome, smiling, friendly, weak, skinny, suit, tie, restaurant kitchen, stainless steel, smooth skin, anime, 3d render, cartoon, blurry, oversaturated, clean apron, missing feathers.
```

---

### 8. `avatar_vy` — THẢO VY / BÉ VY ❤️ (NHÂN TÌNH NẠN NHÂN — 24 TUỔI)
* **Tệp tin lưu trữ:** `avatar_vy.jpg` / `profile-vy.png`
* **Mục đích nghiệp vụ:** Nhận diện người tình trẻ Khang hẹn trốn đi Đà Lạt chuyến 06:15 sáng; kích nổ cơn cuồng ghen của Hà.
* **Mô tả giải phẫu & nhân trắc học (Vietnamese Technical Spec):**
  - Nữ giới 24 tuổi, thế hệ trẻ (Gen Z) tại Hà Nội, phong cách hot girl sành điệu, sang chảnh.
  - Khuôn mặt V-line thon gọn, làn da trắng sứ mịn màng không tì vết. Sống mũi cao thon nhỏ, môi mọng đánh son bóng màu đỏ cam quyến rũ.
  - Mắt to tròn hai mí rõ nét, đường kẻ mắt eyeliner sắc lẹm vút nhẹ, hàng mi dài cong vút.
  - Mái tóc nhuộm màu nâu caramel bồng bềnh uốn sóng nước hiện đại.
  - Mặc áo hai dây bằng lụa satin cao cấp màu xanh ngọc bích khoét cổ sâu vừa phải, đeo sợi dây chuyền vàng trắng 18k mặt kim cương nhỏ tinh tế.
  - **CHỈ DẪN CHỐNG LỖI TAY (ANTI-HAND DEFORMITY DIRECTIVE):** Chụp chân dung bán thân từ ngực trở lên (Head-and-shoulders portrait), **không để bàn tay xuất hiện trong khung hình** để loại trừ 100% rủi ro dị tật ngón tay khi AI vẽ tư thế selfie.
* **Thiết lập góc máy & ánh sáng:** Chụp theo phong cách selfie chân dung điện thoại cao cấp (iPhone Portrait Mode) trong quán lounge/cafe đèn vàng lung linh mờ ảo.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO):**
```text
High-end head-and-shoulders smartphone portrait of a 24-year-old fashionable Vietnamese beauty named Thao Vy, social media influencer aesthetic. Flawless porcelain-white skin with delicate natural pore texture, slender modern V-line face shape, glossy plump coral-red lips, large expressive dark brown almond eyes with crisp winged black eyeliner and delicate long curled lashes. Voluminous wavy caramel-brown dyed hair cascading over one bare shoulder. Wearing a glamorous emerald-green silk satin camisole top with a dainty thin 18k white gold pendant necklace resting on her collarbone. No hands or fingers visible in frame. Flattering soft golden-hour ambient lighting inside an upscale modern cocktail lounge in Hanoi, luxurious bokeh circles in blurred background. Shot on simulated iPhone 15 Pro Max front portrait camera, crisp high-definition commercial fashion look, seductive confident smile, vibrant colors, 8k resolution. --ar 1:1 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI / Fooocus):**
```text
(deformed hands:1.4), (extra fingers:1.4), (mutated fingers:1.4), hands in frame, holding phone in front of face, nsfw, topless, nude, excessive cleavage, (caucasian:1.3), blonde hair, blue eyes, plastic doll skin, uncanny valley, ugly, distorted face, mature woman, wrinkles, anime, 3d render, lowres, blurry.
```

---

### 9. `avatar_huy` — BÉ NGUYỄN GIA HUY (EM TRAI TÙNG — 7 TUỔI, HÈ 1996)
* **Tệp tin lưu trữ:** `avatar_huy.jpg` / `profile-huy.png`
* **Mục đích nghiệp vụ:** Nạn nhân bi kịch 30 năm trước; đối chiếu đặc điểm chiếc còi đồng với ảnh kỷ niệm hè 1996 (`p4`).
* **Mô tả giải phẫu & nhân trắc học (Vietnamese Technical Spec — CỰC KỲ CHI TIẾT):**
  - Bé trai 7 tuổi người Kinh thời điểm mùa hè năm 1996, thể trạng nhỏ thó, gầy gò, hai bả vai nhô gầy, da bánh mật rám nắng thôn quê.
  - Gương mặt ngây thơ, trong sáng vô ngần, hai má hơi hóp nhẹ vì bệnh tim bẩm sinh. Đôi mắt đen láy mở to sáng trong nhưng đượm vẻ câm lặng ngơ ngác (em bị câm không thể nói).
  - Tóc cắt ngắn đầu đinh ba phân kiểu trẻ con nông thôn thập niên 90.
  - **VẬT BẤT LY THÂN BẮT BUỘC (CORE EVIDENCE PROP):** Trước ngực đeo một **sợi dây dù màu cam cũ kỹ, đầu dây buộc một CHIẾC CÒI BẰNG ĐỒNG THAU NHỎ MÀU VÀNG NÂU** (bố mẹ đeo để em thổi báo hiệu khi nguy cấp).
  - Mặc chiếc áo may-ô thun trắng cộc tay cũ kỹ đã ngả sang màu cháo lòng, cổ áo hơi rách sợi chỉ viền.
* **Thiết lập góc máy & ánh sáng:** Màu ảnh phim nhựa cổ điển Kodak Gold 200 hè 1996, viền ảnh hơi mờ quang học, hạt film hoài niệm nhuốm màu thời gian.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO):**
```text
Heartbreaking vintage 1996 color documentary photograph of a frail 7-year-old Kinh Vietnamese mute boy named Gia Huy in summer 1996. Delicate innocent childhood features, slender fragile build with slightly sunken cheeks, sun-kissed golden-tan skin. Large luminous, soulful dark brown eyes filled with pure innocence and quiet silence. Short traditional 3-millimeter buzz-cut black hair. ESSENTIAL ICONIC EVIDENCE PROP: Around his neck hangs an authentic weathered thin orange braided cord carrying a SMALL VINTAGE BRASS WHISTLE resting flat against his chest (used to whistle because he cannot speak). Wearing an authentic worn-out, slightly discolored ribbed white cotton tank top with frayed collar seams. Warm nostalgic Hanoi summer 1996 atmosphere, soft natural afternoon sunlight, authentic Kodak Gold 200 35mm film grain, warm nostalgic tones, vintage Leica M6 with 50mm f/2.8 lens, emotionally poignant historical masterpiece, 8k resolution. --ar 1:1 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI / Fooocus):**
```text
missing whistle, modern whistle, silver whistle, plastic whistle, missing orange cord, smiling happily, cheerful, laughing, chubby child, well-fed, (caucasian child:1.3), blonde hair, blue eyes, modern clothing, t-shirt with graphic print, smartphone, modern background, anime, 3d render, cartoon, blurry.
```

---

## II. DANH MỤC ẢNH HIỆN TRƯỜNG & TƯ LIỆU VẬT CHỨNG (`p1` – `p5`)

---

### 1. `p1` — HIỆN TRƯỜNG & TÁCH TRÀ PHÒNG KHÁCH (`photo-crime-scene-overview.jpg`)
* **Mã vật chứng:** `p1`
* **Ý nghĩa phá án:** Tách trà dính vết mồ hôi/vân tay của Tùng $\rightarrow$ Bóc trần lời khai Tùng nói dối "chỉ gọi điện thoại không hề gặp mặt Khang".
* **Mô tả hiện trường & góc máy kỹ thuật:**
  - Góc chụp xiên 30 độ cận cảnh mặt bàn trà gỗ lim tối màu đã lên nước bóng trong phòng khách nhà nạn nhân.
  - Trên bàn có một bộ ấm chén gốm men lam truyền thống Việt Nam. **Một tách trà sứ men trắng đọng cặn nước trà xanh vàng nhạt ở đáy**.
  - **LƯU Ý TRÁNH LỖI AI:** Không dùng từ khóa "fingerprint" trực tiếp trong prompt tổng thể vì AI sẽ vẽ một dấu vân tay khổng lồ như tem dán lên thành chén. Thay vào đó, miêu tả vết nhờn mờ tự nhiên (faint oily smudge mark) hoặc tập trung vào ảnh hiện trường thực tế.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO / GEMINI IMAGEN 3):**
```text
Authentic gritty crime scene documentary photograph of evidence p1 inside a dimly lit traditional Hanoi residential living room. High-angle close-up focusing on an old dark polished wooden tea table with subtle scratches. In sharp focus is an unwashed traditional Vietnamese white porcelain teacup with delicate blue floral patterns, containing dried yellow tea dregs at the bottom and faint natural grease finger smudges near the rim. A yellow plastic police evidence marker card with "P1" printed on it stands beside the cup. Atmospheric dim room lighting, moody shadows, shot on Hasselblad H6D-100c with 50mm f/4 lens, tactile wood grain texture, raw realistic documentary journalism, 8k resolution. --ar 16:9 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI / Fooocus):**
```text
giant fingerprint decal, printed fingerprint artwork, magnifying glass, floating magnifying glass, plastic scale ruler, 3d render, cartoon, anime, bright sunny room, modern stainless steel table, oversaturated.
```

---

### 2. `p2` — ĐƠN ĐÒI ĐẤT 200M² RƠI VÃI DƯỚI SÀN (`photo-scattered-documents.jpg`)
* **Mã vật chứng:** `p2`
* **Ý nghĩa phá án:** Khởi động Tuyến A; xác định động cơ tranh chấp di sản thừa kế 200m² của Nguyễn Ngọc Mai; Mai ném đơn xuống sàn lúc 19:00.
* **Mô tả hiện trường & góc máy kỹ thuật:**
  - Góc chụp 45 độ từ trên xuống sàn phòng khách cạnh bậu cửa gỗ.
  - Sàn nhà lát **gạch hoa xi măng cổ điển họa tiết hình học màu vàng hoàng yến và xanh rêu** đặc trưng nhà phố Hà Nội cũ.
  - Xấp giấy A4 nhăn nheo rơi vãi. Tờ giấy trên cùng lộ rõ dòng tiêu đề: **"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — ĐƠN ĐỀ NGHỊ GIẢI QUYẾT TRANH CHẤP ĐẤT ĐAI (200m² đất thừa kế)"** với chữ ký mực xanh **Nguyễn Ngọc Mai**. Góc giấy có vệt bụi đế giày dẫm qua.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO / GEMINI IMAGEN 3):**
```text
Authentic forensic crime scene photograph of legal documents scattered across a floor, evidence p2. High-angle 45-degree view of vintage Northern Vietnamese patterned cement floor tiles with yellow and olive-green geometric patterns. Disheveled, crumpled official A4 paper legal documents strewn near an aged wooden door frame. The topmost paper clearly displays printed formal Vietnamese headline text: "CONG HOA XA HOI CHU NGHIA VIET NAM - DON DE NGHI GIAI QUYET TRANH CHAP DAT DAI", with a bold blue ink signature "Tran Ngoc Mai" at the bottom right. A faint dusty shoe tread smudge marks the edge of the paper. Realistic low ambient evening flashlight beam, shot on Nikon Z8, 35mm f/2.8 lens, ultra-sharp paper fiber texture and authentic tiled floor, raw documentary realism, 8k resolution. --ar 16:9 --style raw --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI / Fooocus):**
```text
yellow plastic markers, bright yellow rulers, cartoon, 3d render, wooden floor, office carpet, blank white paper, pristine tidy documents, colorful brochures, anime, blurry text, oversaturated.
```

---

### 3. `p3` — MẢNH BÌNH TRÀ VỠ DÍNH MÁU — HUNG KHÍ (`photo-glass-shard-detail.jpg`)
* **Mã vật chứng:** `p3`
* **Ý nghĩa phá án:** Hung khí trực tiếp gây án của Trần Thị Hà lúc 21:00; vết đâm cứa đứt động mạch cảnh cổ trái.
* **Mô tả hiện trường & góc máy kỹ thuật:**
  - Macro cận cảnh mảnh vỡ thủy tinh/gốm dày hình tam giác sắc nhọn từ chiếc bình pha trà bị đập vỡ.
  - Mũi nhọn và cạnh sắc dính vệt máu người đặc quánh màu đỏ thẫm đẫm khô. Mảnh kính nằm trên nền gạch men bên vũng máu sẫm màu đông đặc. Ánh đèn pin hình sự chiếu góc thấp phản chiếu cạnh sắc lạnh lùng.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO / GEMINI IMAGEN 3):**
```text
Extreme macro forensic photograph of the fatal murder weapon shard, evidence p3. Direct close-up focus on a heavy 8cm triangular shard of thick fractured transparent glass from a broken teapot lying on an old patterned tiled floor. The razor-sharp tip and jagged edge are stained with thick coagulated dark crimson blood and dried blood spatters. Surrounding floor tiles show dark blood pooling. Cold high-intensity directional forensic flashlight beam hitting the razor-sharp crystal glass facet, dramatic shadows, shot on Sony A7R V with 90mm f/2.8 Macro lens, edge-to-edge extreme sharpness, visceral realistic noir documentary photo, 8k resolution. --ar 16:9 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI / Fooocus):**
```text
vernier caliper, metal measuring tool, yellow plastic marker, kitchen knife, firearm, unbroken glass, clean glass, digital tools, bright happy lighting, cartoon, 3d render, cgi, blurry.
```

---

### 4. `p4` — ẢNH KỶ NIỆM XÓM BỜ SÔNG HÈ 1996 (`photo-childhood-group.jpg`)
* **Mã vật chứng:** `p4`
* **Ý nghĩa phá án:** Khóa danh tính Tùng là anh trai bé Huy; Tùng có sẹo chữ V ở mày trái; khung ảnh vỡ khi Tùng xô ngã Khang lúc 20:00.
* **Mô tả hiện trường & góc máy kỹ thuật:**
  - Khung ảnh gỗ để bàn 15x20cm rơi trên sàn, mặt kính vỡ rạn chân chim hình mạng nhện.
  - Bên trong là bức ảnh màu chụp hè năm 1996 rặng cây xóm Bờ Sông (nước ảnh Kodak ố vàng). Ảnh chụp nhóm 5 đứa trẻ Việt Nam, trong đó nổi bật thiếu niên 10 tuổi (Tùng) có vết sẹo chữ V ở mày trái ôm em trai 7 tuổi (Huy) đeo chiếc còi đồng dây dù màu cam trước ngực.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO / GEMINI IMAGEN 3):**
```text
Forensic still-life photograph of evidence p4: an antique dark brown wooden desk photo frame lying flat on an aged floor, its glass cover heavily shattered with spiderweb fracture cracks. Beneath the cracked glass is a nostalgic 1996 summer color photograph of 5 Vietnamese neighborhood children along a Hanoi riverbank lane. On the right side of the photo, a protective 10-year-old boy (young Tung) with a distinct pale V-shaped scar on his left eyebrow holds his frail 7-year-old mute brother (Gia Huy) who wears a bright orange braided cord carrying a small brass whistle on his chest. Authentic 1990s Kodak Gold 200 film grain, warm faded yellow tones, dusty glass shards. Shot on Canon EOS R5 with 50mm f/2.8 lens, poignant poetic storytelling, raw photography, 8k resolution. --ar 16:9 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI / Fooocus):**
```text
extra limbs, deformed hands, merged faces, missing scar, scar on right eyebrow, missing brass whistle, modern clothes, caucasian children, intact glass, 3d render, anime, cgi, blurry.
```

---

### 5. `p5` — MẢNH BÁO CŨ 1996 XÉ VỤN GHÉP LẠI (`photo-old-newspaper.jpg`)
* **Mã vật chứng:** `p5`
* **Ý nghĩa phá án:** Bài báo ngày 26/07/1996 về vụ bé Huy chết ngạt trong tủ gỗ; Tùng mang sang đối chất rồi xé vụn lúc 20:00.
* **Mô tả hiện trường & góc máy kỹ thuật:**
  - Ảnh giám định văn bản hình sự chụp từ trên xuống (Top-down Flat Lay).
  - Các mảnh báo cũ ố vàng 1996 bị xé vụn được ghép tỉ mỉ lại trên tấm thảm cắt màu xám. Tiêu đề bài báo in rõ chữ tiếng Việt: **"BI KỊCH TỪ TRÒ TRỐN TÌM: MỘT CHÁU BÉ TỬ VONG TRONG TỦ GỖ"**.

> 📝 **BULLETPROOF PROMPT (MIDJOURNEY v6 / FLUX.1 PRO / GEMINI IMAGEN 3):**
```text
Forensic document reconstruction flat-lay photograph of evidence p5 inside a police lab. An aged yellowed Vietnamese newspaper clipping from July 1996, torn into jagged pieces and reassembled like a puzzle on a neutral grey mat. Fragile newsprint paper displays bold printed Vietnamese headline text across the torn pieces: "BI KICH TRO CHOI TRON TIM: MOT CHAU BE TU VONG TRONG TU GO", with subtext mentioning "N.G.H 7 tuoi". Overhead uniform laboratory inspection lighting, high contrast, sharp paper fiber edges, authentic vintage newsprint texture, forensic analysis realism, 8k resolution. --ar 16:9 --style raw --s 75 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI / Fooocus):**
```text
untorn newspaper, pristine paper, modern glossy magazine, English newspaper, computer screen, wooden table, anime, 3d render, blurry text.
```

---

## III. DANH MỤC ẢNH CHỤP MÀN HÌNH THIẾT BỊ (DEVICE SCREENSHOTS)

---

### 1. `p10` — SCREENSHOT LỊCH SỬ APP ĐẶT XE CỦA LÊ QUANG VŨ (`screenshot-ride-app-vu.png`)
* **Mã vật chứng:** `p10`
* **Ý nghĩa phá án:** Bắt thóp Vũ nói dối mốc giờ 19:00; chứng minh Vũ nán lại 30 phút (19:00 – 19:30) xin hoãn nợ 300M.
* **Mô tả ảnh chi tiết (Vietnamese UI Spec):**
  - Ảnh chụp màn hình giao diện ứng dụng đặt xe công nghệ trên smartphone Android/iOS bằng tiếng Việt hoàn chỉnh.
  - Màn hình biên lai cuốc xe *"Chi tiết chuyến đi đã hoàn thành"* ngày **24/07/2016**:
    - **Loại xe:** Xe máy (Bike).
    - **Thời gian gửi lệnh đặt xe (Booking Time):** `19:25:40 — 24/07/2016`.
    - **Thời gian tài xế đón (Pickup Time):** `19:30:15`.
    - **Điểm đón (Pin xanh):** *Đầu Ngõ 14, Đường Bờ Sông, Phân khu Cảng*.
    - **Điểm trả (Pin đỏ):** *Quán Bia 88 — Ven Sông Khu Cầu Cảng (cách 3.8 km)*.
    - **Giá cước:** `32.000 VNĐ` (Thanh toán Tiền mặt).
    - **Tài xế:** *Nguyễn Văn T. — Honda Wave Alpha đỏ (BKS: 29X1-582.44)*.
    - **Trạng thái:** `Chuyến đi đã hoàn thành lúc 19:42`. Màn hình có vài vết xước dăm nhẹ và vết vân tay mờ để tăng tính chân thật.

> 📝 **BULLETPROOF PROMPT / UI MOCKUP (MIDJOURNEY v6 / FLUX.1 PRO):**
```text
Photorealistic direct screenshot of a mobile ride-hailing app interface on a modern smartphone screen in Vietnamese language. Clean modern mobile UI design with high-contrast typography. Title bar reads: "Chi tiet chuyen di". Ride completed receipt showing: Date "24/07/2016", Booking request timestamp "19:25:40", Pickup timestamp "19:30:15". Pickup point with green pin: "Dau Ngo 14, Duong Bo Song". Drop-off point with red pin: "Quan Bia 88 - Ven Song Cau Cang (3.8 km)". Vehicle icon: motorbike (Bike). Fare amount: "32.000 d" (Tien mat). Driver info: "Nguyen Van T. - Honda Wave Alpha 29X1-582.44", 5-star rating. Green status banner: "Chuyen di da hoan thanh 19:42". Crisp pixel-perfect UI graphics, authentic Vietnamese mobile app aesthetic, subtle glass screen glare and faint microscopic screen dust, photorealistic smartphone screen capture, 8k resolution. --ar 9:16 --style raw --s 50 --v 6.0
```

> 🚫 **NEGATIVE PROMPT (Dành cho Stable Diffusion 3 / WebUI / Fooocus):**
```text
english text, chinese characters, car icon instead of bike, broken UI layout, desktop website, tablet interface, hand holding phone, selfie, cartoon graphics, distorted icons, blurry typography, dark mode, distorted letters.
```

---

## IV. HƯỚNG DẪN TẠO ẢNH CHỐNG LỖI (ANTI-FAIL WORKFLOW)

1. **Với Midjourney v6:**
   - Sao chép nguyên văn đoạn trong ô code `📝 BULLETPROOF PROMPT`.
   - Giữ nguyên thông số: `--ar 1:1` (chân dung) hoặc `--ar 16:9` (hiện trường) hoặc `--ar 9:16` (screenshot).
   - Thiết lập `--style raw --s 75` để ép model bám sát tả thực, không tự tiện cách điệu nghệ thuật (tránh biến ảnh thành hoạt hình hoặc thêm hoa văn thừa).
2. **Với Flux.1 Pro / Stable Diffusion 3 / Fooocus / ComfyUI:**
   - Dán prompt vào ô **Positive Prompt**.
   - Dán khung `🚫 NEGATIVE PROMPT` tương ứng vào ô **Negative Prompt** để chặn hoàn toàn lỗi mắt lác hai bên, sai vị trí sẹo, hay biến dạng ngón tay.
   - Sử dụng Sampler **DPM++ 2M Karras** hoặc **Euler A**, Steps: **40 - 50**, CFG Scale: **5.5 - 6.5**.
3. **Quy trình xử lý tiểu tiết bằng Inpainting / Vary Region:**
   - Nếu tạo ảnh `avatar_vu` mà mắt trái chưa lệch đủ độ: Dùng công cụ Inpainting quét vùng mắt trái, nhập prompt: `close-up realistic human left eye with mild outward strabismus exotropia, natural pupil drift, 8k`.
   - Nếu tạo ảnh `avatar_tung` hoặc `p4` mà vết sẹo bị mờ: Quét vùng đuôi mày trái, nhập prompt: `sharp pale white V-shaped scar cutting vertically through black eyebrow hair, crisp forensic detail`.
   - Nếu tạo ảnh `avatar_huy` hoặc `p4` mà chiếc còi bị mờ: Quét vùng ngực, nhập prompt: `small vintage golden brass whistle attached to a bright orange braided cord resting on chest`.

