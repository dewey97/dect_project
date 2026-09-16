# KIẾN TRÚC LOGIC & VÒNG LẶP ĐIỀU TRA
**(REASONING ARCHITECTURE & GAMEPLAY LOOP)**

---

## I. SƠ ĐỒ DÒNG CHẢY LOGIC (REASONING & EVIDENCE FLOW)

```text
 [TẦNG 1: DỮ LIỆU THÔ]   Sự thật khách quan ➔ Thời gian thực ➔ Hành động gây án ➔ Dấu vết hiện trường
                                  │
                                  ▼
 [TẦNG 2: GIẢI MÃ]       Evidence (Chứng cứ) ➔ [Lab / UV / Log] ➔ Clue (Manh mối) ➔ Lead (Đầu mối)
                                  │
                                  ▼
 [TẦNG 3: SUY LUẬN]      Clue ➔ Inference (Suy luận) ➔ Contradiction (Mâu thuẫn) ➔ Hypothesis (Giả thuyết)
                                  │
                                  ▼
 [TẦNG 4: KẾT ÁN]        Giả thuyết + Chứng cứ then chốt ➔ Proof Chain (Đồ thị kết án) ➔ Verdict
```

---

## II. VÒNG LẶP ĐIỀU TRA CỦA NGƯỜI CHƠI (GAMEPLAY LOOP)

```text
 [1. KHẢO SÁT] (Hỏi cung, xem hiện trường)
       │
       ▼
 [2. GHI NHẬN] (Phát hiện điểm bất thường)
       │
       ▼
 [3. THU THẬP] (Đóng gói thành Evidence EVI-XXX)
       │
       ▼
 [4. PHÂN TÍCH] (Thao tác Lab / UV / Metadata EXIF trên Web OS)
       │
       ▼
 [5. SUY LUẬN] (Bẻ gãy alibi, đối chiếu mâu thuẫn)
       │
       ▼
 [6. MỞ ĐẦU MỐI] (Unlock Lead / Địa điểm / Câu hỏi mới) ──> Quay lại [1. KHẢO SÁT]
```

---

## III. NGUYÊN TẮC LIÊN KẾT PHỤ THUỘC (DEPENDENCY RULES)

1. **Strict Upstream Traceability:** Mọi `Clue` bắt buộc trỏ về `Evidence` gốc. Mọi `Inference` bắt buộc trỏ về ít nhất 1 `Clue`.
2. **Proof Graph Integrity:** `requiredProofGraph` không được chứa chu trình vòng (Cyclic Dependency) hoặc node mồ côi (Unreachable Node).
