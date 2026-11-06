"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DOSSIER_CANVAS_PRESETS,
  createCustomCanvasTheme,
  type CanvasThemeConfig,
  type GridType,
  type LampTone,
} from "../dossier-canvas-themes";

/**
 * Table surface theme of the dossier canvas: preset or custom (base colour,
 * lamp tone and intensity, grid), saved in localStorage, and switched to a
 * matching preset when the UI goes light or dark.
 */
export function useCanvasTheme(uiTheme: "dark" | "light") {
  const [canvasTheme, setCanvasTheme] = useState<CanvasThemeConfig>(DOSSIER_CANVAS_PRESETS[0]);

  // Tự động căn chỉnh mặt bàn hồ sơ phù hợp với chế độ Sáng / Tối khi đổi UI Theme
  useEffect(() => {
    if (uiTheme === "light") {
      setCanvasTheme((prev) => {
        if (prev.id === "mahogany-warm" || prev.id === "noir-leather" || prev.id === "obsidian-minimal") {
          const lightPreset = DOSSIER_CANVAS_PRESETS.find((p) => p.id === "light-linen");
          return lightPreset || prev;
        }
        return prev;
      });
    } else if (uiTheme === "dark") {
      setCanvasTheme((prev) => {
        if (prev.id === "light-linen" || prev.id === "architect-vellum") {
          return DOSSIER_CANVAS_PRESETS[0];
        }
        return prev;
      });
    }
  }, [uiTheme]);
  const [isThemePopupOpen, setIsThemePopupOpen] = useState<boolean>(false);
  const [themeActiveTab, setThemeActiveTab] = useState<"presets" | "custom">("presets");
  const [customBaseColor, setCustomBaseColor] = useState<string>("#130f0b");
  const [customLampTone, setCustomLampTone] = useState<LampTone>("warm");
  const [customLampIntensity, setCustomLampIntensity] = useState<number>(1);
  const [customGridType, setCustomGridType] = useState<GridType>("crosses");
  const themePopupRef = useRef<HTMLDivElement>(null);

  // Nạp theme đã lưu từ localStorage sau khi mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("dect_dossier_canvas_theme");
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme) as CanvasThemeConfig;
        if (parsed && parsed.baseColor) {
          setCanvasTheme(parsed);
          if (parsed.isCustom) {
            setCustomBaseColor(parsed.baseColor);
            setCustomLampTone(parsed.lampTone || "warm");
            setCustomLampIntensity(parsed.lampIntensity ?? 1);
            setCustomGridType(parsed.gridType || "crosses");
            setThemeActiveTab("custom");
          }
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleApplyTheme = useCallback((theme: CanvasThemeConfig) => {
    setCanvasTheme(theme);
    try {
      localStorage.setItem("dect_dossier_canvas_theme", JSON.stringify(theme));
    } catch {
      // Ignore
    }
  }, []);

  const handleUpdateCustomTheme = useCallback(
    (base: string, lamp: LampTone, intensity: number, grid: GridType) => {
      setCustomBaseColor(base);
      setCustomLampTone(lamp);
      setCustomLampIntensity(intensity);
      setCustomGridType(grid);
      const customTheme = createCustomCanvasTheme(base, lamp, intensity, grid);
      handleApplyTheme(customTheme);
    },
    [handleApplyTheme]
  );

  const handleResetDefaultTheme = useCallback(() => {
    handleApplyTheme(DOSSIER_CANVAS_PRESETS[0]);
    setCustomBaseColor("#130f0b");
    setCustomLampTone("warm");
    setCustomLampIntensity(1);
    setCustomGridType("crosses");
  }, [handleApplyTheme]);

  return {
    canvasTheme,
    isThemePopupOpen,
    setIsThemePopupOpen,
    themeActiveTab,
    setThemeActiveTab,
    customBaseColor,
    customLampTone,
    customLampIntensity,
    customGridType,
    themePopupRef,
    handleApplyTheme,
    handleUpdateCustomTheme,
    handleResetDefaultTheme,
  };
}
