/**
 * Unit test cho `isVietnameseTextMatch` trong lib/finding-matcher.ts.
 *
 * Kiểm chứng cơ chế so khớp tên nghi phạm giữa input người chơi và đáp án trên
 * Google Sheet: chấp nhận khác dấu/khác hoa thường/tên gọi tắt, đồng thời chặn
 * các trường hợp khớp chuỗi con sai (Khang lọt vào Hà, Vương lọt vào Vũ).
 *
 * Chạy: npx tsx scripts/test-fuzzy-matcher.ts
 */
import { isVietnameseTextMatch } from "../lib/finding-matcher";

const cases: [string, string, boolean][] = [
  // 1. Trùng khớp hoàn toàn (có/không dấu, hoa/thường)
  ["Lê Quang Vũ", "Lê Quang Vũ", true],
  ["le quang vu", "Lê Quang Vũ", true],
  ["LE QUANG VU", "Lê Quang Vũ", true],
  ["Nguyễn Thanh Tùng", "Nguyễn Thanh Tùng", true],
  ["nguyen thanh tung", "Nguyễn Thanh Tùng", true],
  ["Trần Thị Hà", "Trần Thị Hà", true],
  ["tran thi ha", "Trần Thị Hà", true],
  ["Đạt Gà", "Đạt Gà", true],
  ["dat ga", "Đạt Gà", true],

  // 2. Đáp án một từ (tên gọi tắt trên Sheet)
  ["Vũ", "Vũ", true],
  ["vu", "Vũ", true],
  ["Hà", "Hà", true],
  ["ha", "Hà", true],
  ["Tùng", "Tùng", true],
  ["tung", "Tùng", true],

  // 3. Người chơi gõ tên tắt, Sheet để họ tên đầy đủ
  ["Vũ", "Lê Quang Vũ", true],
  ["vu", "Lê Quang Vũ", true],
  ["Tùng", "Nguyễn Thanh Tùng", true],
  ["tung", "Nguyễn Thanh Tùng", true],
  ["Hà", "Trần Thị Hà", true],
  ["ha", "Trần Thị Hà", true],
  ["Đạt", "Trần Văn Đạt", true],
  ["dat", "Trần Văn Đạt", true],
  ["Đạt Gà", "Đạt Gà Chợ Cảng", true],
  ["dat ga", "Đạt Gà Chợ Cảng", true],

  // 4. Người chơi gõ họ tên đầy đủ, Sheet chỉ để tên tắt
  ["Lê Quang Vũ", "Vũ", true],
  ["le quang vu", "vu", true],
  ["Trần Thị Hà", "Hà", true],
  ["tran thi ha", "ha", true],
  ["Nguyễn Thanh Tùng", "Tùng", true],
  ["nguyen thanh tung", "tung", true],
  ["Thanh", "Nguyễn Thanh Tùng", true],

  // 5. Chống lọt — các trường hợp so khớp chuỗi con thô bị sai
  ["Khang", "Hà", false],
  ["khang", "ha", false],
  ["khang", "Trần Thị Hà", false],
  ["Khang", "Trần Thị Hà", false],
  ["Vương", "Vũ", false],
  ["vuong", "vu", false],
  ["Vương", "Lê Quang Vũ", false],
  ["Lê Hoàng", "Lê Quang Vũ", false],
  ["Nguyễn Văn A", "Trần Thị Hà", false],
];

let failed = 0;
cases.forEach(([input, candidate, expected]) => {
  const actual = isVietnameseTextMatch(input, candidate);
  if (actual !== expected) {
    failed++;
    console.error(
      `FAIL: input="${input}", candidate="${candidate}" => nhận ${actual}, mong đợi ${expected}`,
    );
  }
});

if (failed === 0) {
  console.log(`PASS toàn bộ ${cases.length}/${cases.length} test cases.`);
} else {
  console.error(`FAILED: ${failed}/${cases.length} test cases.`);
  process.exit(1);
}
