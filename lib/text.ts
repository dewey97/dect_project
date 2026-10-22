/**
 * Tiện ích xử lý chuỗi tiếng Việt — dùng chung toàn dự án.
 *
 * Quy tắc: mỗi hàm chỉ làm MỘT việc; nơi gọi tự chain thêm bước riêng nếu cần.
 */

/**
 * Bỏ dấu tiếng Việt (combining marks) và thay đ/Đ → d/D.
 * Giữ nguyên hoa/thường và khoảng trắng.
 */
export function stripDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Bỏ dấu + lowercase + trim. Dùng cho so khớp tên/chuỗi tiếng Việt.
 */
export function normalizeForMatch(str: string): string {
  return stripDiacritics(str).toLowerCase().trim();
}

/**
 * Sinh slug kỹ thuật: bỏ dấu + lowercase + thay ký tự không phải [a-z0-9] bằng `_` + trim `_` hai đầu.
 * Dùng để sinh key/ID từ tiêu đề tiếng Việt.
 */
export function slugifyVietnamese(str: string): string {
  return stripDiacritics(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
