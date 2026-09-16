# TIÊU CHUẨN KIỂM TOÁN LOGIC & BẪY PHI LOGIC THƯỜNG GẶP
**(VALIDATION STANDARDS & PITFALLS)**

---

## I. TIÊU CHUẨN KIỂM TOÁN LOGIC (VALIDATION CHECKLIST)

1. **Location Overlap Check (Kiểm tra Phân thân):** Cùng 1 nhân vật không thể xuất hiện ở 2 địa điểm khác nhau trong cùng khoảng thời gian.
2. **Post-Mortem Action Check:** Nạn nhân không được có hành động/lời khai sau thời điểm tử vong thực tế (`TimeOfDeath`).
3. **Proof Graph Reachability:** Mọi node trong đồ thị kết án `requiredProofGraph` đều có thể đạt được từ các manh mối thu thập được.
4. **Physical Speed Feasibility:** Thời gian di chuyển giữa 2 địa điểm A và B phải $\ge \text{Khoảng cách} / \text{Vận tốc thực tế}$.

---

## II. 8 BẪY PHI LOGIC CẤM PHẠM PHẢI (COMMON PITFALLS)

1. ❌ **Bẫy 1 — Giấu chứng cứ phút chót (Deus Ex Machina):** Bất ngờ xuất hiện bằng chứng mới không hề được gợi ý trước đó.
2. ❌ **Bẫy 2 — Hung thủ không có ngoại phạm:** Hung thủ thừa nhận phạm tội chỉ vì không có alibi (vi phạm quy tắc loại trừ).
3. ❌ **Bẫy 3 — Red Herring vô danh:** Nhét đồ vật lạ vào hiện trường nhưng không giải thích vì sao nó ở đó.
4. ❌ **Bẫy 4 — Nhân vật nói dối không động cơ:** Nghi phạm khai gian vô căn cứ chỉ để gây nhiễu cho người chơi.
5. ❌ **Bẫy 5 — Công nghệ ma thuật:** Giải án bằng thuật toán hack không có thực hoặc thiết bị viễn tưởng.
6. ❌ **Bẫy 6 — Đồ thị suy luận bị đứt đoạn (Soft Lock):** Thiếu manh mối để mở ra địa điểm/câu hỏi tiếp theo.
7. ❌ **Bẫy 7 — Mâu thuẫn thời gian tẩu thoát:** Hung thủ gây án và tẩu thoát trong khoảng thời gian không đủ thực hiện thao tác vật lý.
8. ❌ **Bẫy 8 — Đa đáp án hợp lý nhưng game chỉ công nhận 1:** Có 2 nghi phạm cùng thỏa mãn 100% bằng chứng nhưng không có chứng cứ độc bản để phân định.
