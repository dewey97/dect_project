# ĐẶC TẢ HỆ THỐNG XÁC THỰC (VERIFICATION SYSTEM) — VERITAS

> **Nhiệm vụ Hệ thống:** Bộ thuật toán xử lý đồ thị chứng cứ (Graph Verification Engine), so khớp chuỗi lập luận người chơi đính kèm với đáp án chuẩn trong Case Schema.

---

## 01. Thuật Toán Graph Matching (So Khớp Đồ Thị)

```
[Node Hung Thủ] ──(Động cơ)──► [Node Bằng Chứng A] ──(Timeline)──► [Node Bằng Chứng B]
```

* Hệ thống không chỉ kiểm tra ID của hung thủ.
* Hệ thống so khớp danh sách `attachedEvidenceIds` của người chơi với tập các cạnh đồ thị bắt buộc (`requiredEdges`) trong file `solution.json`.
* **Trạng thái hợp lệ:** Đáp án đúng + Đủ chuỗi bằng chứng bắt buộc $\rightarrow$ **VALIDATED**.
* **Trạng thái thiếu chứng cứ:** Đáp án đúng + Thiếu bằng chứng chứng minh $\rightarrow$ **INSUFFICIENT PROOF (Rejected)**.