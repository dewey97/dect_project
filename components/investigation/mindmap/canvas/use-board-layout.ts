"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CaseConnection,
  PinPoint,
} from "@/components/investigation/hero-interactive";
import { getBoardgamePinPositions } from "@/lib/actions/board-actions";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getStorageJson,
  setStorageJson,
} from "@/lib/storage";

const LAYOUT_VERSION = "2026.10.10_v8_db_sync";

/**
 * Quản lý layout bảng điều tra cho màn chơi Gameplay (Chế độ chỉ đọc).
 * Các thao tác kéo thả, tạo node, nối dây đã chuyển toàn bộ sang Checkpoint Studio (Board Studio).
 */
export function useBoardLayout(caseId: string = "case-000") {
  const pinsKey = `boardgame_pins_${caseId}`;
  const adminPinsKey = `admin_custom_pins_${caseId}`;
  const transformsKey = `boardgame_transforms_${caseId}`;
  const connectionsKey = `admin_connections_${caseId}`;

  const [customPinPositions, setCustomPinPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [adminCustomPins, setAdminCustomPins] = useState<PinPoint[]>([]);
  const [adminConnections, setAdminConnections] = useState<CaseConnection[]>([]);
  const [pinTransforms, setPinTransforms] = useState<
    Record<string, { rotation: number; scale: number }>
  >({});
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initLayout() {
      const savedLayoutVersion = getStorageItem("board_layout_version");
      if (savedLayoutVersion !== LAYOUT_VERSION) {
        removeStorageItem(pinsKey);
        removeStorageItem(adminPinsKey);
        removeStorageItem(transformsKey);
        removeStorageItem(connectionsKey);
        setStorageItem("board_layout_version", LAYOUT_VERSION);
      }

      setCustomPinPositions(
        getStorageJson<Record<string, { x: number; y: number }>>(pinsKey, {}),
      );
      setAdminCustomPins(getStorageJson<PinPoint[]>(adminPinsKey, []));
      setPinTransforms(
        getStorageJson<Record<string, { rotation: number; scale: number }>>(
          transformsKey,
          {},
        ),
      );
      setAdminConnections(
        getStorageJson<CaseConnection[]>(connectionsKey, []),
      );

      try {
        const res = await getBoardgamePinPositions(caseId);
        if (res.success && res.pins.length > 0) {
          const posMap: Record<string, { x: number; y: number }> = {};
          const dbCustomPins: PinPoint[] = [];
          res.pins.forEach((p) => {
            posMap[p.id] = { x: p.x, y: p.y };
            if (
              p.id.startsWith("admin-pin-") ||
              p.id.startsWith("custom-pin-")
            ) {
              dbCustomPins.push(p);
            }
          });
          setCustomPinPositions(posMap);
          const tfMap: Record<string, { rotation: number; scale: number }> = {};
          res.pins.forEach((p) => {
            if (typeof p.rotation === "number" || typeof p.scale === "number") {
              tfMap[p.id] = {
                rotation: p.rotation ?? 0,
                scale: p.scale ?? 1.0,
              };
            }
          });
          setPinTransforms(tfMap);
          if (dbCustomPins.length > 0) {
            setAdminCustomPins(dbCustomPins);
          }
          if (res.connections && res.connections.length > 0) {
            setAdminConnections(res.connections);
          }
          setStorageJson(pinsKey, posMap);
          setStorageJson(transformsKey, tfMap);
          if (dbCustomPins.length > 0) {
            setStorageJson(adminPinsKey, dbCustomPins);
          }
          if (res.connections && res.connections.length > 0) {
            setStorageJson(connectionsKey, res.connections);
          }
        }
      } catch {}
    }
    initLayout();
  }, [caseId, pinsKey, adminPinsKey, transformsKey, connectionsKey]);

  return {
    isAdmin: false,
    isEditMode: false,
    customPinPositions,
    adminCustomPins,
    adminConnections,
    pinTransforms,
    selectedPinId,
    setSelectedPinId,
    canvasWrapperRef,
    // Null-op handlers for backward compatibility
    handlePinPositionChange: (_pinId: string, _x: number, _y: number) => {},
    handleConnectPins: (_from: string, _to: string) => {},
    handleDeleteConnection: (_id: string) => {},
  };
}
