// Pen, highlighter and sticky-note presets of the dossier canvas.
// Bảng màu & Kích thước chuyên biệt cho Bút vẽ (Pen)
export const PEN_PALETTE = [
  { color: "#dc2626", label: "Đỏ điều tra" },
  { color: "#171717", label: "Bút chì đen" },
  { color: "#2563eb", label: "Xanh mực máy" },
  { color: "#16a34a", label: "Xanh lá cây" },
  { color: "#9333ea", label: "Tím ghi chú" },
  { color: "#ea580c", label: "Cam cảnh báo" },
];

export const PEN_SIZES = [
  { size: 1.5, label: "Mảnh", dot: "size-1.5" },
  { size: 2.5, label: "Vừa", dot: "size-2.5" },
  { size: 4.5, label: "Đậm", dot: "size-3.5" },
  { size: 7.0, label: "Cọ lớn", dot: "size-5" },
];

// Bảng màu & Kích thước chuyên biệt cho Bút nhớ dạ quang (Highlighter)
export const HIGHLIGHTER_PALETTE = [
  { color: "#facc15", label: "Vàng dạ quang" },
  { color: "#4ade80", label: "Xanh lục dạ quang" },
  { color: "#38bdf8", label: "Xanh dương sáng" },
  { color: "#f472b6", label: "Hồng dạ quang" },
  { color: "#fb923c", label: "Cam dạ quang" },
];

export const HIGHLIGHTER_SIZES = [
  { size: 8, label: "Hẹp", bar: "h-2 w-6" },
  { size: 14, label: "Vừa", bar: "h-3.5 w-6" },
  { size: 22, label: "Rộng", bar: "h-5 w-6" },
];

// Bảng màu cho Giấy dán note (Sticky Note)
export const STICKY_NOTE_COLORS = [
  { color: "#fef08a", border: "#facc15", text: "#713f12", label: "Vàng pastel" },
  { color: "#bae6fd", border: "#7dd3fc", text: "#0369a1", label: "Xanh dương" },
  { color: "#bbf7d0", border: "#86efac", text: "#15803d", label: "Xanh lá" },
  { color: "#fbcfe8", border: "#f472b6", text: "#be185d", label: "Hồng pastel" },
  { color: "#fed7aa", border: "#fb923c", text: "#c2410c", label: "Cam pastel" },
  { color: "#f5f5f4", border: "#d6d3d1", text: "#44403c", label: "Trắng ngà" },
];
