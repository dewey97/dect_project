/**
 * Phone Device Presets & Hardware Specifications
 *
 * Cung cấp thông số vật lý và hình học cho khung điện thoại (chassis),
 * hỗ trợ 7 đời máy iPhone từ cổ điển (Touch ID) đến hiện đại (Dynamic Island).
 */

export type PhonePresetId =
  | "iphone_se"
  | "iphone_8_plus"
  | "iphone_classic"
  | "iphone_12_mini"
  | "iphone_13"
  | "iphone_15"
  | "iphone_15_pro_max";

export type BezelKind = "touch_id" | "notch" | "dynamic_island";

export interface PhoneDevicePreset {
  id: PhonePresetId;
  name: string;
  description: string;
  chassis: "iphone_classic" | "iphone_modern";
  bezelKind: BezelKind;
  frameW: number;
  frameH: number;
  screenW: number;
  screenH: number;
  borderRadius: number;
  screenRadius: number;
  hasPhysicalHomeButton: boolean;
  hasHomeIndicator: boolean;
  topBezelHeight?: number;
  bottomBezelHeight?: number;
}

/**
 * 7 Presets iPhone chuẩn được hỗ trợ trong game engine.
 * Android Vintage bị ẩn khỏi select (chưa có renderer).
 */
export const PHONE_DEVICE_PRESETS: Record<PhonePresetId, PhoneDevicePreset> = {
  iphone_se: {
    id: "iphone_se",
    name: "iPhone SE (2020)",
    description: "375×667 • Viền trên/dưới • Nút Home Touch ID",
    chassis: "iphone_classic",
    bezelKind: "touch_id",
    frameW: 375,
    frameH: 667,
    screenW: 375,
    screenH: 520,
    borderRadius: 38,
    screenRadius: 6,
    hasPhysicalHomeButton: true,
    hasHomeIndicator: false,
    topBezelHeight: 68,
    bottomBezelHeight: 68,
  },
  iphone_8_plus: {
    id: "iphone_8_plus",
    name: "iPhone 8 Plus",
    description: "414×736 • Viền trên/dưới • Màn hình lớn 16:9",
    chassis: "iphone_classic",
    bezelKind: "touch_id",
    frameW: 414,
    frameH: 736,
    screenW: 375,
    screenH: 590,
    borderRadius: 44,
    screenRadius: 8,
    hasPhysicalHomeButton: true,
    hasHomeIndicator: false,
    topBezelHeight: 70,
    bottomBezelHeight: 70,
  },
  iphone_classic: {
    id: "iphone_classic",
    name: "iPhone 6s Plus (Cổ điển)",
    description: "415×768 • Khung kim loại bo tròn • Bối cảnh 2016",
    chassis: "iphone_classic",
    bezelKind: "touch_id",
    frameW: 415,
    frameH: 768,
    screenW: 375,
    screenH: 600,
    borderRadius: 48,
    screenRadius: 8,
    hasPhysicalHomeButton: true,
    hasHomeIndicator: false,
    topBezelHeight: 72,
    bottomBezelHeight: 72,
  },
  iphone_12_mini: {
    id: "iphone_12_mini",
    name: "iPhone 12 mini",
    description: "375×812 • Viền vuông • Tai thỏ (Notch)",
    chassis: "iphone_modern",
    bezelKind: "notch",
    frameW: 375,
    frameH: 812,
    screenW: 375,
    screenH: 812,
    borderRadius: 42,
    screenRadius: 36,
    hasPhysicalHomeButton: false,
    hasHomeIndicator: true,
  },
  iphone_13: {
    id: "iphone_13",
    name: "iPhone 13",
    description: "390×844 • Màn hình tràn viền • Tai thỏ nhỏ gọn",
    chassis: "iphone_modern",
    bezelKind: "notch",
    frameW: 390,
    frameH: 844,
    screenW: 390,
    screenH: 844,
    borderRadius: 46,
    screenRadius: 40,
    hasPhysicalHomeButton: false,
    hasHomeIndicator: true,
  },
  iphone_15: {
    id: "iphone_15",
    name: "iPhone 15",
    description: "393×852 • Dynamic Island • Viền mỏng",
    chassis: "iphone_modern",
    bezelKind: "dynamic_island",
    frameW: 393,
    frameH: 852,
    screenW: 393,
    screenH: 852,
    borderRadius: 50,
    screenRadius: 42,
    hasPhysicalHomeButton: false,
    hasHomeIndicator: true,
  },
  iphone_15_pro_max: {
    id: "iphone_15_pro_max",
    name: "iPhone 15 Pro Max",
    description: "430×932 • Dynamic Island • Khung Titanium",
    chassis: "iphone_modern",
    bezelKind: "dynamic_island",
    frameW: 430,
    frameH: 932,
    screenW: 430,
    screenH: 932,
    borderRadius: 54,
    screenRadius: 46,
    hasPhysicalHomeButton: false,
    hasHomeIndicator: true,
  },
};

export const DEVICE_PRESET_LIST: PhoneDevicePreset[] =
  Object.values(PHONE_DEVICE_PRESETS);

export const DEFAULT_DEVICE_PRESET = PHONE_DEVICE_PRESETS.iphone_classic;

/**
 * Tìm preset thiết bị theo model_id hoặc chassis fallback.
 */
export function getDevicePreset(
  modelId?: string | null,
  chassisFallback?: string | null,
): PhoneDevicePreset {
  if (modelId && modelId in PHONE_DEVICE_PRESETS) {
    return PHONE_DEVICE_PRESETS[modelId as PhonePresetId];
  }

  // Fallback theo chassis legacy
  if (chassisFallback === "iphone_modern") {
    return PHONE_DEVICE_PRESETS.iphone_15;
  }

  return DEFAULT_DEVICE_PRESET;
}
