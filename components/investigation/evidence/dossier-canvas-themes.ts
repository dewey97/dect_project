"use client";

export type GridType = "crosses" | "dots" | "grid" | "none";
export type LampTone = "warm" | "cool" | "cyan" | "none";

export interface CanvasThemeConfig {
  id: string;
  name: string;
  description: string;
  outerBg: string;
  baseColor: string;
  glowColorCenter: string;
  glowColorMid: string;
  glowColorOuter: string;
  gridColor: string;
  gridType: GridType;
  lampIntensity: number; // 0 to 1
  swatchGradient: string;
  lampTone?: LampTone;
  isCustom?: boolean;
}

export const DOSSIER_CANVAS_PRESETS: CanvasThemeConfig[] = [
  {
    id: "mahogany-warm",
    name: "Gỗ gụ ấm áp (Mặc định)",
    description: "Mặt bàn gỗ gụ cổ điển, ánh đèn vàng dịu chiếu tâm hồ sơ",
    outerBg: "#090705",
    baseColor: "#130f0b",
    glowColorCenter: "rgba(250, 232, 195, 0.14)",
    glowColorMid: "rgba(195, 142, 85, 0.32)",
    glowColorOuter: "rgba(26, 19, 14, 0.88)",
    gridColor: "rgba(238, 214, 172, 0.42)",
    gridType: "crosses",
    lampIntensity: 1,
    swatchGradient: "radial-gradient(circle at 40% 40%, #c38e55 0%, #3a2214 60%, #130f0b 100%)",
    lampTone: "warm",
  },
  {
    id: "noir-leather",
    name: "Da đen Noir",
    description: "Bàn da đen bóng phòng thẩm tra, ánh sáng lạnh sắc nét",
    outerBg: "#07080a",
    baseColor: "#0e1014",
    glowColorCenter: "rgba(210, 225, 245, 0.12)",
    glowColorMid: "rgba(60, 85, 115, 0.28)",
    glowColorOuter: "rgba(18, 22, 28, 0.92)",
    gridColor: "rgba(160, 185, 215, 0.35)",
    gridType: "crosses",
    lampIntensity: 1,
    swatchGradient: "radial-gradient(circle at 40% 40%, #465f7d 0%, #1c222b 60%, #0e1014 100%)",
    lampTone: "cool",
  },
  {
    id: "court-baize",
    name: "Nỉ xanh lưu trữ",
    description: "Vải nỉ xanh sẫm phòng lưu trữ hồ sơ viện kiểm sát",
    outerBg: "#050d09",
    baseColor: "#0b1a14",
    glowColorCenter: "rgba(235, 248, 220, 0.13)",
    glowColorMid: "rgba(45, 115, 80, 0.30)",
    glowColorOuter: "rgba(12, 30, 22, 0.92)",
    gridColor: "rgba(130, 215, 165, 0.35)",
    gridType: "crosses",
    lampIntensity: 1,
    swatchGradient: "radial-gradient(circle at 40% 40%, #2d7350 0%, #153325 60%, #0b1a14 100%)",
    lampTone: "warm",
  },
  {
    id: "forensic-slate",
    name: "Xanh giám định pháp y",
    description: "Bàn đá phiến và khay kim loại phòng giám định hiện trường",
    outerBg: "#060a10",
    baseColor: "#0c1520",
    glowColorCenter: "rgba(195, 230, 255, 0.14)",
    glowColorMid: "rgba(40, 85, 125, 0.30)",
    glowColorOuter: "rgba(12, 22, 34, 0.92)",
    gridColor: "rgba(120, 185, 235, 0.35)",
    gridType: "dots",
    lampIntensity: 1,
    swatchGradient: "radial-gradient(circle at 40% 40%, #356b94 0%, #172738 60%, #0c1520 100%)",
    lampTone: "cyan",
  },
  {
    id: "amber-oak",
    name: "Gỗ sồi hổ phách",
    description: "Gỗ sồi già mộc mạc, ánh đèn halogen rọi sáng tâm bàn",
    outerBg: "#0c0704",
    baseColor: "#1b110a",
    glowColorCenter: "rgba(255, 225, 175, 0.18)",
    glowColorMid: "rgba(195, 115, 45, 0.36)",
    glowColorOuter: "rgba(32, 19, 11, 0.90)",
    gridColor: "rgba(245, 190, 130, 0.42)",
    gridType: "crosses",
    lampIntensity: 1,
    swatchGradient: "radial-gradient(circle at 40% 40%, #c3732d 0%, #482813 60%, #1b110a 100%)",
    lampTone: "warm",
  },
  {
    id: "obsidian-minimal",
    name: "Đen tuyền tối giản",
    description: "Đen sâu tương phản cao, làm nổi bật tối đa biên bản & tài liệu",
    outerBg: "#050505",
    baseColor: "#0a0a0c",
    glowColorCenter: "rgba(255, 255, 255, 0.08)",
    glowColorMid: "rgba(80, 80, 85, 0.16)",
    glowColorOuter: "rgba(18, 18, 20, 0.94)",
    gridColor: "rgba(160, 160, 165, 0.28)",
    gridType: "dots",
    lampIntensity: 0.7,
    swatchGradient: "radial-gradient(circle at 40% 40%, #3f3f46 0%, #18181b 60%, #0a0a0c 100%)",
    lampTone: "cool",
  },
  {
    id: "vintage-taupe",
    name: "Xám xì-gà cổ điển",
    description: "Tông xám ấm trầm phong cách văn phòng cảnh sát thập niên 80",
    outerBg: "#0c0c0b",
    baseColor: "#171614",
    glowColorCenter: "rgba(250, 240, 225, 0.13)",
    glowColorMid: "rgba(140, 125, 105, 0.26)",
    glowColorOuter: "rgba(26, 24, 21, 0.90)",
    gridColor: "rgba(210, 195, 175, 0.32)",
    gridType: "crosses",
    lampIntensity: 1,
    swatchGradient: "radial-gradient(circle at 40% 40%, #8c7d69 0%, #33302a 60%, #171614 100%)",
    lampTone: "warm",
  },
];

export const QUICK_CUSTOM_COLORS = [
  { color: "#130f0b", label: "Gỗ gụ" },
  { color: "#0e1014", label: "Da đen" },
  { color: "#0b1a14", label: "Nỉ xanh" },
  { color: "#0c1520", label: "Đá slate" },
  { color: "#1b110a", label: "Gỗ sồi" },
  { color: "#0a0a0c", label: "Đen tuyền" },
  { color: "#1b1822", label: "Tím than" },
  { color: "#1a1318", label: "Rượu vang" },
];

/**
 * Tạo SVG data URL cho từng loại lưới định vị
 */
function getGridSvg(gridType: GridType, gridColor: string): string | null {
  if (gridType === "crosses") {
    return `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 20v8M20 24h8' stroke='${encodeURIComponent(
      gridColor
    )}' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E")`;
  }
  if (gridType === "dots") {
    return `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='1.2' fill='${encodeURIComponent(
      gridColor
    )}'/%3E%3C/svg%3E")`;
  }
  if (gridType === "grid") {
    return `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='${encodeURIComponent(
      gridColor
    )}' stroke-width='0.75'/%3E%3C/svg%3E")`;
  }
  return null;
}

/**
 * Xây dựng CSS backgroundImage, backgroundSize, backgroundPosition cho canvas
 */
export function buildCanvasBackground(
  theme: CanvasThemeConfig,
  zoomScale: number,
  pan: { x: number; y: number }
): React.CSSProperties {
  const intensity = theme.lampIntensity ?? 1;

  let glowLayer = "none";
  if (intensity > 0.05 && theme.lampTone !== "none") {
    glowLayer = `radial-gradient(circle at 50% 48%, ${theme.glowColorCenter} 0%, ${theme.glowColorMid} 32%, ${theme.glowColorOuter} 68%, ${theme.outerBg} 100%)`;
  }

  const gridSvg = getGridSvg(theme.gridType, theme.gridColor);
  const gridSize =
    theme.gridType === "dots" ? 32 : theme.gridType === "grid" ? 40 : 48;

  if (!gridSvg || theme.gridType === "none") {
    return {
      backgroundColor: theme.baseColor,
      backgroundImage: glowLayer !== "none" ? glowLayer : undefined,
      backgroundSize: "100% 100%",
    };
  }

  if (glowLayer !== "none") {
    return {
      backgroundColor: theme.baseColor,
      backgroundImage: `${glowLayer}, ${gridSvg}`,
      backgroundSize: `100% 100%, ${gridSize * zoomScale}px ${gridSize * zoomScale}px`,
      backgroundPosition: `center center, ${pan.x}px ${pan.y}px`,
    };
  }

  return {
    backgroundColor: theme.baseColor,
    backgroundImage: gridSvg,
    backgroundSize: `${gridSize * zoomScale}px ${gridSize * zoomScale}px`,
    backgroundPosition: `${pan.x}px ${pan.y}px`,
  };
}

/**
 * Tính toán màu glow và outer từ base color người dùng chọn
 */
export function createCustomCanvasTheme(
  baseColor: string,
  lampTone: LampTone = "warm",
  lampIntensity = 1,
  gridType: GridType = "crosses"
): CanvasThemeConfig {
  let glowColorCenter = "rgba(250, 232, 195, 0.14)";
  let glowColorMid = "rgba(195, 142, 85, 0.32)";
  let gridColor = "rgba(238, 214, 172, 0.42)";

  if (lampTone === "cool") {
    glowColorCenter = `rgba(210, 225, 245, ${0.12 * lampIntensity})`;
    glowColorMid = `rgba(60, 85, 115, ${0.28 * lampIntensity})`;
    gridColor = "rgba(160, 185, 215, 0.35)";
  } else if (lampTone === "cyan") {
    glowColorCenter = `rgba(195, 230, 255, ${0.14 * lampIntensity})`;
    glowColorMid = `rgba(40, 85, 125, ${0.30 * lampIntensity})`;
    gridColor = "rgba(120, 185, 235, 0.35)";
  } else if (lampTone === "none") {
    glowColorCenter = "transparent";
    glowColorMid = "transparent";
    gridColor = "rgba(180, 180, 180, 0.25)";
  } else {
    // warm
    glowColorCenter = `rgba(250, 232, 195, ${0.15 * lampIntensity})`;
    glowColorMid = `rgba(195, 142, 85, ${0.32 * lampIntensity})`;
    gridColor = "rgba(238, 214, 172, 0.42)";
  }

  return {
    id: "custom",
    name: "Tùy biến cá nhân",
    description: `Màu nền ${baseColor.toUpperCase()} • Đèn ${lampTone} • Lưới ${gridType}`,
    outerBg: baseColor,
    baseColor,
    glowColorCenter,
    glowColorMid,
    glowColorOuter: "rgba(10, 10, 10, 0.85)",
    gridColor,
    gridType,
    lampIntensity,
    swatchGradient: `radial-gradient(circle at 40% 40%, ${glowColorMid} 0%, ${baseColor} 100%)`,
    lampTone,
    isCustom: true,
  };
}
