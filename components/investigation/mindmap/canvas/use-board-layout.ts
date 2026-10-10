"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CaseConnection,
  PinPoint,
} from "@/components/investigation/hero-interactive";
import { detectiveAudio } from "@/lib/investigation-audio";
import { checkIsAdmin } from "@/lib/actions/auth-guard";
import {
  getBoardgamePinPositions,
  saveBoardgamePinPositions,
} from "@/lib/actions/board-actions";
import { toast } from "@/components/ui/toast";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getStorageJson,
  setStorageJson,
} from "@/lib/storage";
import React from "react";

export type LayoutSnapshot = {
  posMap: Record<string, { x: number; y: number }>;
  adminPins: PinPoint[];
  transforms: Record<string, { rotation: number; scale: number }>;
  connections: CaseConnection[];
};

const LAYOUT_VERSION = "2026.10.10_v7_no_pin_string";

/** Quản lý layout bảng, edit mode, undo/redo, Supabase sync, cache cục bộ. */
export function useBoardLayout() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [customPinPositions, setCustomPinPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [adminCustomPins, setAdminCustomPins] = useState<PinPoint[]>([]);
  const [adminConnections, setAdminConnections] = useState<CaseConnection[]>(
    [],
  );
  const [pinTransforms, setPinTransforms] = useState<
    Record<string, { rotation: number; scale: number }>
  >({});
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectionAnchor, setSelectionAnchor] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const layoutRef = useRef<LayoutSnapshot>({
    posMap: {},
    adminPins: [],
    transforms: {},
    connections: [],
  });
  const historyRef = useRef<{
    past: LayoutSnapshot[];
    future: LayoutSnapshot[];
  }>({ past: [], future: [] });
  const lastGestureRef = useRef<{ key: string; time: number }>({
    key: "",
    time: 0,
  });

  useEffect(() => {
    layoutRef.current.posMap = customPinPositions;
  }, [customPinPositions]);

  useEffect(() => {
    layoutRef.current.adminPins = adminCustomPins;
  }, [adminCustomPins]);

  useEffect(() => {
    layoutRef.current.transforms = pinTransforms;
  }, [pinTransforms]);

  useEffect(() => {
    layoutRef.current.connections = adminConnections;
  }, [adminConnections]);

  const cloneLayout = (
    src: LayoutSnapshot = layoutRef.current,
  ): LayoutSnapshot => ({
    posMap: { ...src.posMap },
    adminPins: src.adminPins.map((p) => ({ ...p })),
    transforms: { ...src.transforms },
    connections: [...src.connections],
  });

  const applyLayout = useCallback((snapshot: LayoutSnapshot) => {
    setCustomPinPositions(snapshot.posMap);
    setAdminCustomPins(snapshot.adminPins);
    setPinTransforms(snapshot.transforms);
    setAdminConnections(snapshot.connections);
    setHasUnsavedChanges(true);
  }, []);

  /** Ghi 1 bước vào lịch sử. gestureKey dùng để gộp thao tác kéo thả liên tục. */
  const commitLayout = useCallback(
    (mutate: (draft: LayoutSnapshot) => LayoutSnapshot, gestureKey: string) => {
      const before = cloneLayout();
      const after = mutate(cloneLayout());

      const now = Date.now();
      const sameGesture =
        gestureKey !== "" &&
        lastGestureRef.current.key === gestureKey &&
        now - lastGestureRef.current.time < 800;
      lastGestureRef.current = { key: gestureKey, time: now };

      if (!sameGesture) {
        historyRef.current.past.push(before);
        if (historyRef.current.past.length > 100) {
          historyRef.current.past.shift();
        }
        historyRef.current.future = [];
      }

      layoutRef.current = after;
      applyLayout(after);
    },
    [applyLayout],
  );

  const handleUndo = useCallback(() => {
    const h = historyRef.current;
    if (h.past.length === 0) return;
    const previous = h.past.pop()!;
    h.future.push(cloneLayout());
    lastGestureRef.current = { key: "", time: 0 };
    layoutRef.current = previous;
    detectiveAudio.playPaperRustle();
    applyLayout(previous);
    toast.info("Đã hoàn tác (Ctrl+Z)");
  }, [applyLayout]);

  const handleRedo = useCallback(() => {
    const h = historyRef.current;
    if (h.future.length === 0) return;
    const next = h.future.pop()!;
    h.past.push(cloneLayout());
    lastGestureRef.current = { key: "", time: 0 };
    layoutRef.current = next;
    detectiveAudio.playTypewriterClick();
    applyLayout(next);
    toast.info("Đã làm lại (Ctrl+Shift+Z)");
  }, [applyLayout]);

  useEffect(() => {
    if (!isAdmin || !isEditMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAdmin, isEditMode, handleUndo, handleRedo]);

  useEffect(() => {
    async function initAdminAndLayout() {
      if (process.env.NODE_ENV === "development") {
        setIsAdmin(true);
      } else {
        try {
          const isAdminRole = await checkIsAdmin();
          if (isAdminRole) setIsAdmin(true);
        } catch (err) {
          console.error("Error checking admin role:", err);
        }
      }

      const savedLayoutVersion = getStorageItem("board_layout_version");
      if (savedLayoutVersion !== LAYOUT_VERSION) {
        removeStorageItem("boardgame_pins_case-000");
        removeStorageItem("admin_custom_pins_case-000");
        removeStorageItem("boardgame_transforms_case-000");
        removeStorageItem("admin_connections_case-000");
        setStorageItem("board_layout_version", LAYOUT_VERSION);
      }

      setCustomPinPositions(
        getStorageJson<Record<string, { x: number; y: number }>>(
          "boardgame_pins_case-000",
          {},
        ),
      );
      setAdminCustomPins(
        getStorageJson<PinPoint[]>("admin_custom_pins_case-000", []),
      );
      setPinTransforms(
        getStorageJson<Record<string, { rotation: number; scale: number }>>(
          "boardgame_transforms_case-000",
          {},
        ),
      );
      setAdminConnections(
        getStorageJson<CaseConnection[]>("admin_connections_case-000", []),
      );

      try {
        const res = await getBoardgamePinPositions("case-000");
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
          if (dbCustomPins.length > 0) {
            setAdminCustomPins(dbCustomPins);
          }
          setStorageJson("boardgame_pins_case-000", posMap);
          if (dbCustomPins.length > 0) {
            setStorageJson("admin_custom_pins_case-000", dbCustomPins);
          }
        }
      } catch {}
    }
    initAdminAndLayout();
  }, []);

  const handleSaveAdminPin = useCallback(
    (pin: PinPoint) => {
      commitLayout((draft) => {
        const exists = draft.adminPins.some((p) => p.id === pin.id);
        const nextAdminPins = exists
          ? draft.adminPins.map((p) => (p.id === pin.id ? pin : p))
          : [...draft.adminPins, pin];
        const nextPosMap = {
          ...draft.posMap,
          [pin.id]: { x: pin.x, y: pin.y },
        };
        setStorageJson("admin_custom_pins_case-000", nextAdminPins);
        return {
          posMap: nextPosMap,
          adminPins: nextAdminPins,
          transforms: draft.transforms,
          connections: draft.connections,
        };
      }, `save-pin-${pin.id}`);
      toast.success("Đã thêm ghim vào bảng!");
    },
    [commitLayout],
  );

  const handleDeleteAdminPin = useCallback(
    (pinId: string) => {
      commitLayout((draft) => {
        const nextAdminPins = draft.adminPins.filter((p) => p.id !== pinId);
        const nextPosMap = { ...draft.posMap };
        const nextTransforms = { ...draft.transforms };
        delete nextPosMap[pinId];
        delete nextTransforms[pinId];
        const nextConns = draft.connections.filter(
          (c) => c.fromPinId !== pinId && c.toPinId !== pinId,
        );
        setStorageJson("admin_custom_pins_case-000", nextAdminPins);
        setStorageJson("boardgame_transforms_case-000", nextTransforms);
        setStorageJson("admin_connections_case-000", nextConns);
        return {
          posMap: nextPosMap,
          adminPins: nextAdminPins,
          transforms: nextTransforms,
          connections: nextConns,
        };
      }, `delete-pin-${pinId}`);
      toast.info("Đã xoá ghim khỏi bảng!");
    },
    [commitLayout],
  );

  /** Xoay / phóng to thu nhỏ node đang chọn ngay trên bảng (không cần mở modal) */
  const handleAdjustNodeTransform = useCallback(
    (pinId: string, deltaRot: number, deltaScale: number) => {
      detectiveAudio.playTypewriterClick();
      commitLayout((draft) => {
        const adminPin = draft.adminPins.find((p) => p.id === pinId);
        const current = draft.transforms[pinId];
        const curRot = current?.rotation ?? adminPin?.rotation ?? 0;
        const curScale = current?.scale ?? adminPin?.scale ?? 1.0;
        const nextTransforms = {
          ...draft.transforms,
          [pinId]: {
            rotation: Math.round(curRot + deltaRot),
            scale: Math.max(
              0.3,
              Math.min(2.5, Math.round((curScale + deltaScale) * 10) / 10),
            ),
          },
        };
        setStorageJson("boardgame_transforms_case-000", nextTransforms);
        return {
          posMap: draft.posMap,
          adminPins: draft.adminPins,
          transforms: nextTransforms,
          connections: draft.connections,
        };
      }, `transform-${pinId}`);
    },
    [commitLayout],
  );

  const handleConnectPins = useCallback(
    (fromPinId: string, toPinId: string) => {
      if (fromPinId === toPinId) return;
      const connId1 = `admin-conn-${fromPinId}-${toPinId}`;
      const connId2 = `admin-conn-${toPinId}-${fromPinId}`;
      commitLayout((draft) => {
        const existingIndex = draft.connections.findIndex(
          (c) =>
            c.id === connId1 ||
            c.id === connId2 ||
            (c.fromPinId === fromPinId && c.toPinId === toPinId) ||
            (c.fromPinId === toPinId && c.toPinId === fromPinId),
        );
        const exists = existingIndex !== -1;
        const nextConns = exists
          ? draft.connections.filter((_, idx) => idx !== existingIndex)
          : [...draft.connections, { id: connId1, fromPinId, toPinId }];
        setStorageJson("admin_connections_case-000", nextConns);
        if (exists) {
          toast.info("Đã tháo dây chỉ đỏ giữa 2 node!");
        } else {
          toast.success("Đã nối dây chỉ đỏ giữa 2 node!");
        }
        return { ...draft, connections: nextConns };
      }, `toggle-connect-${fromPinId}-${toPinId}`);
    },
    [commitLayout],
  );

  const handleDeleteConnection = useCallback(
    (connId: string) => {
      commitLayout((draft) => {
        const nextConns = draft.connections.filter((c) => c.id !== connId);
        setStorageJson("admin_connections_case-000", nextConns);
        return { ...draft, connections: nextConns };
      }, `delete-conn-${connId}`);
      toast.info("Đã tháo dây chỉ đỏ!");
    },
    [commitLayout],
  );

  const handlePinPositionChange = useCallback(
    (pinId: string, newX: number, newY: number) => {
      commitLayout((draft) => {
        return {
          ...draft,
          posMap: { ...draft.posMap, [pinId]: { x: newX, y: newY } },
        };
      }, `drag-${pinId}`);
    },
    [commitLayout],
  );

  /** Ép khôi phục & xóa toàn bộ cache cũ về layout mới nhất của hệ thống */
  const handleForceResetLayout = useCallback(() => {
    detectiveAudio.playPaperRustle();
    removeStorageItem("boardgame_pins_case-000");
    removeStorageItem("admin_custom_pins_case-000");
    removeStorageItem("boardgame_transforms_case-000");
    removeStorageItem("admin_connections_case-000");
    setStorageItem("board_layout_version", "2026.10.10_v5_force_sync");
    setCustomPinPositions({});
    setAdminCustomPins([]);
    setPinTransforms({});
    setAdminConnections([]);
    setSelectedPinId(null);
    setHasUnsavedChanges(false);
    toast.success("Đã ép cập nhật và nạp lại layout mới nhất từ hệ thống!");
  }, []);

  const handleSavePinLayout = async (pinsToSave: PinPoint[]) => {
    setIsSavingLayout(true);
    try {
      const posMap: Record<string, { x: number; y: number }> = {};
      pinsToSave.forEach((p) => {
        posMap[p.id] = { x: p.x, y: p.y };
      });
      setStorageItem("boardgame_pins_case-000", JSON.stringify(posMap));
      setCustomPinPositions(posMap);
    } catch {}

    try {
      const res = await saveBoardgamePinPositions("case-000", pinsToSave);
      if (res.success) {
        toast.success("Đã lưu vị trí ghim lên Supabase DB & Cục bộ!");
        setHasUnsavedChanges(false);
      } else {
        toast.error(
          "Đã lưu cục bộ! (Supabase lỗi: " +
            (res.error || "Chưa tạo bảng boardgame_pins") +
            ")",
        );
        setHasUnsavedChanges(false);
      }
    } catch (err: any) {
      toast.error("Đã lưu cục bộ! (Supabase lỗi: " + err.message + ")");
      setHasUnsavedChanges(false);
    } finally {
      setIsSavingLayout(false);
    }
  };

  return {
    isAdmin,
    setIsAdmin,
    isEditMode,
    setIsEditMode,
    isSavingLayout,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    customPinPositions,
    setCustomPinPositions,
    adminCustomPins,
    setAdminCustomPins,
    adminConnections,
    setAdminConnections,
    pinTransforms,
    setPinTransforms,
    selectedPinId,
    setSelectedPinId,
    selectionAnchor,
    setSelectionAnchor,
    canvasWrapperRef,
    commitLayout,
    handleUndo,
    handleRedo,
    handleSaveAdminPin,
    handleDeleteAdminPin,
    handleAdjustNodeTransform,
    handleConnectPins,
    handleDeleteConnection,
    handlePinPositionChange,
    handleForceResetLayout,
    handleSavePinLayout,
  };
}
