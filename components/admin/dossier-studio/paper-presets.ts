import type { PaperConfig } from "@/lib/types/dossier";

// Khổ giấy cố định chuẩn in ấn tư pháp: Lời khai A4 Dọc, Lý lịch A4 Ngang
export const FIXED_LK_PAPER: PaperConfig = {
  size: "A4",
  orientation: "portrait",
};

export const FIXED_HS_PAPER: PaperConfig = {
  size: "A4",
  orientation: "landscape",
};
