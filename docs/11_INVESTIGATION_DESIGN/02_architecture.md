# SƠ ĐỒ KIẾN TRÚC THAM CHIẾU & VÒNG LẶP ĐIỀU TRA (REFERENCE ARCHITECTURE & INVESTIGATION LOOP) 

> **Nhiệm vụ Cốt lõi:** Bản vẽ kiến trúc logic và vòng lặp gameplay tổng thể của dự án. Sơ đồ này quy định dòng chảy dữ liệu logic và chuỗi hành vi tương tác của người chơi trong quá trình khai quật sự thật.

---

## 🗺️ 01. Sơ Đồ Dòng Chảy Logic Hệ Thống (Reasoning & Evidence Flow)

Dòng chảy dữ liệu logic và suy luận trong thiết kế vụ án được quy định theo cấu trúc tầng dưới đây:

```text
 [TẦNG 1: DỮ LIỆU THÔ]   Sự thật khách quan
                                │
                                ▼
                         Trục thời gian thực
                                │
                                ▼
                         Hành động gây án
                                │
                                ▼
                         Dấu vết hiện trường

 ─────────────────────────────────────────────────────────────────────────────

 [TẦNG 2: GIẢI MÃ]       Evidence (Chứng cứ)
                                │ (Phân tích Lab / Đèn UV / Ảnh EXIF)
                                ▼
                         Clue (Manh mối) ──> Lead (Đầu mối)

 ─────────────────────────────────────────────────────────────────────────────

 [TẦNG 3: SUY LUẬN]      Clue (Manh mối) ──> Inference (Bước suy luận) ──┐
                                                                         ▼
                         Lời khai ──[Đối chiếu]── Chứng cứ ──> Contradiction (Mâu thuẫn)
                                                                         │
                                                                         ▼
                                                                  Hypothesis (Giả thuyết)

 ─────────────────────────────────────────────────────────────────────────────

 [TẦNG 4: KẾT ÁN]        Giả thuyết + Chứng cứ then chốt
                                │
                                ▼
                         Xâu chuỗi (Proof Chain) ──> Verdict (Báo cáo kết án)
```

### 📋 Tóm tắt dòng chảy logic bằng văn bản thuần:

* **Tầng 1: Thực tế & Dữ liệu thô**
  `Sự thật tuyệt đối` $\rightarrow$ `Dòng thời gian thực` $\rightarrow$ `Hành động gây án` $\rightarrow$ `Dấu vết hiện trường`.
* **Tầng 2: Khám phá & Giải mã**
  `Dấu vết hiện trường` $\rightarrow$ `Evidence (Chứng cứ)` $\rightarrow$ `Clue (Manh mối)` $\rightarrow$ `Lead (Đầu mối)`.
* **Tầng 3: Tư duy & Suy luận**
  * `Clue (Manh mối)` $\rightarrow$ `Inference (Bước suy luận)` $\rightarrow$ `Hypothesis (Giả thuyết)`.
  * `Chứng cứ` + `Lời khai` $\rightarrow$ `Contradiction (Mâu thuẫn)` $\rightarrow$ `Hypothesis (Giả thuyết)`.
* **Tầng 4: Kết án**
  `Giả thuyết` + `Chứng cứ then chốt` $\rightarrow$ `Xâu chuỗi (Proof Chain)` $\rightarrow$ `Verdict (Báo cáo kết án)`.

---

## 🔁 02. Vòng Lặp Điều Tra Của Người Chơi (Gameplay Loop)

Trong quá trình chơi game, người chơi sẽ tương tác và giải mã vụ án thông qua một vòng lặp hành vi khép kín dưới đây:

```text
  [1. KHẢO SÁT] (Hỏi cung, khảo sát hiện trường)
        │
        ▼
  [2. GHI NHẬN] (Quan sát dấu vết trực quan)
        │
        ▼
  [3. THU THẬP] (Đóng gói thành Evidence)
        │
        ▼
  [4. PHÂN TÍCH] (Thao tác trên máy trạm Lab/UV/EXIF)
        │
        ▼
  [5. SUY LUẬN] (Logic loại trừ, tìm Contradiction)
        │
        ▼
  [6. MỞ ĐẦU MỐI] (Mở khóa địa điểm, nghi phạm hoặc Lead mới) ──> Quay lại [1. KHẢO SÁT]
```

1. **Khảo sát (Explore):** Di chuyển giữa các địa điểm, đọc lời khai ban đầu của các nghi phạm.
2. **Ghi nhận (Observe):** Phát hiện các điểm bất thường trực quan tại hiện trường (Vd: tư thế nằm úp đầu, vết nhớt tràn).
3. **Thu thập (Collect):** Đưa vật thể vào kho chứng cứ và gán mã định danh `EVI-XXX` để quản lý.
4. **Phân tích (Analyze):** Dùng các công cụ chuyên sâu trên máy trạm (Workstation) để bóc tách thông số kỹ thuật bên trong vật chứng.
5. **Suy luận (Infer):** Thực hiện loại trừ logic, tìm mâu thuẫn để bẻ gãy ngoại phạm của nghi phạm.
6. **Mở đầu mối (Unlock Lead):** Mở ra câu hỏi chặng hoặc địa điểm mới từ kết quả suy luận thành công, lặp lại vòng lặp cho đến khi hoàn thành Xâu chuỗi (Proof Chain).
