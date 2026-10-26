"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CaseConnection,
  PinPoint,
} from "@/components/investigation/hero-interactive";
import type { DbCaseBoardNode } from "@/lib/types/database";
import { useBoardModel } from "./use-board-model";

/**
 * Quản lý layout bảng điều tra cho màn chơi Gameplay (Chế độ chỉ đọc).
 * Kế thừa trực tiếp từ hook dùng chung useBoardModel(caseId).
 */
export function useBoardLayout(caseId: string = "case_000") {
  const boardModel = useBoardModel(caseId);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const adminCustomPins = boardModel.pins.filter(
    (p) =>
      p.id.startsWith("admin-pin-") ||
      p.id.startsWith("custom-pin-") ||
      p.id.includes(":custom:"),
  );

  return {
    isAdmin: false,
    isEditMode: false,
    boardNodes: boardModel.boardNodes,
    customPinPositions: boardModel.positions,
    adminCustomPins,
    adminConnections: boardModel.connections,
    pinTransforms: boardModel.transforms,
    selectedPinId,
    setSelectedPinId,
    canvasWrapperRef,
    // Null-op handlers for backward compatibility
    handlePinPositionChange: (_pinId: string, _x: number, _y: number) => {},
    handleConnectPins: (_from: string, _to: string) => {},
    handleDeleteConnection: (_id: string) => {},
  };
}
