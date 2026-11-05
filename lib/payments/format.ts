/** 69000 -> "69.000đ". Manual grouping: same output on server and browser (no ICU differences). */
export function formatVnd(amount: number): string {
  const digits = String(Math.round(Math.abs(amount)));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${amount < 0 ? "-" : ""}${grouped}đ`;
}
