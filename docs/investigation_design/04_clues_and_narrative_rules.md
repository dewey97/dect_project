# QUY TẮC PHÂN BỔ MANH MỐI, ĐỘ KHÓ & PATTERN THIẾT KẾ
**(CLUE DISTRIBUTION, DIFFICULTY SCALING & DESIGN PATTERNS)**

---

## I. 4 PHÂN HẠNG MANH MỐI (CLUE DISTRIBUTION)

1. **Mandatory Clues (Manh Mối Bắt Buộc):** Nằm trong đồ thị kết án `requiredProofGraph`. Thiếu một trong số này vụ án bị Soft Lock.
2. **Optional Clues (Manh Mối Bối Cảnh):** Hỗ trợ củng cố loại trừ hoặc hiểu sâu bối cảnh, không bắt buộc để kết án.
3. **Red Herrings (Manh Mối Lạc Hướng CÓ ĐỘNG CƠ):** Hướng người chơi nghi ngờ sai. **Bắt buộc phải có lời giải thích động cơ cá nhân/tội ác phụ riêng**, cấm nhét "rác hiện trường vô danh".
4. **World Building Clues (Manh Mối Thế Giới):** Liên kết với vũ trụ game (1-2 manh mối/vụ án), không nằm trong đồ thị kết án bắt buộc.

---

## II. MA TRẬN TIÊU CHUẨN ĐỘ KHÓ (DIFFICULTY SCALING MATRIX)

| Chỉ số Định lượng | Dễ (1⭐) | Trung Bình (2-3⭐) | Khó (4⭐) | Chuyên Gia (5⭐) |
|---|---|---|---|---|
| Số lượng Nghi phạm | 3 | 4 | 5 - 6 | 6+ |
| Số bước suy luận (Proof Graph Depth) | 2 - 3 | 4 - 5 | 6 - 7 | 8+ |
| Tỉ lệ Red Herring (Lạc hướng) | 10% | 25% | 40% | 50% |
| Số địa điểm hiện trường | 1 - 2 | 3 - 4 | 5 - 6 | 7+ |

---

## III. NGUYÊN TẮC NHẤT QUÁN TỰ SỰ (NARRATIVE CONSISTENCY)

1. **Character Voice & Motive:** Nhân vật chỉ khai dối khi có động cơ tâm lý đủ mạnh.
2. **Spatial-Temporal Tightness:** Tốc độ di chuyển giữa các địa điểm phải phù hợp thực tế giao thông/địa lý.
3. **Fair-Play Clue Visibility:** Không giấu chứng cứ then chốt ở những nơi phi lý hay không thể truy cập.
