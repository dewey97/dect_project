# AGENTS.md — Agent Working Rules & Guidelines

## 1. Strict Commit Control (Quy tắc Git Commit)
- Agent **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CHẠY `git commit`** sau khi chỉnh sửa file hay làm xong tác vụ.
- Chỉ thực hiện lệnh `git commit` khi người dùng phát lệnh hoặc yêu cầu trực tiếp (Ví dụ: "commit", "commit đi", "hãy commit cho tôi").

## 2. Consultative & Proposal-First Workflow (Quy tắc Đề xuất trước khi thực thi)
- Khi người dùng đặt vấn đề, đưa ra yêu cầu mới hoặc thắc mắc: Agent **bắt buộc phải giải thích, phân tích vấn đề và đưa ra các phương án/đề xuất** trước.
- **CHỈ TIẾN HÀNH VIẾT CODE HOẶC CHỈNH SỬA FILE KHI NGƯỜI DÙNG ĐÃ XÁC NHẬN / ĐỒNG Ý ("OKE", CHỌN PHƯƠNG ÁN)**.
- Không tự ý thực thi viết mã hoặc sửa file hàng loạt trước khi người dùng phê duyệt phương án.

## 3. Project Architecture & Style Standards
- Tuân thủ nghiêm ngặt các quy định trong `PROJECT_RULES.md`.
- Đảm bảo tính nhất quán của hệ thống tài liệu: `storyline.md` (Cốt truyện thuần túy), `gameplay_design.md` (Cơ chế & Luồng chơi), `evidence_manifest.md` (Danh mục manh mối & Master Asset Table), và bộ tài liệu LaTeX trong `latex/` & PDF trong `pdf/`.
