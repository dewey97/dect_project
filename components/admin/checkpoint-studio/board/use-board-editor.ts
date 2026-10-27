"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PinPoint,
  CaseConnection,
} from "@/components/investigation/hero-interactive";
import type { DbCaseBoardNode, DbCaseCheckpoint, DbCaseCharacter } from "@/lib/types/database";
import {
  saveBoardNode,
  deleteBoardNode,
  saveBoardNodesBatch,
  saveBoardgamePinPositions,
  type BoardNodeDraft,
} from "@/lib/actions/board-actions";
import { useBoardModel } from "@/components/investigation/mindmap/canvas/use-board-model";
import { toast } from "@/components/ui/toast";

export interface BoardEditorSnapshot {
  nodes: DbCaseBoardNode[];
  pins: PinPoint[];
  connections: CaseConnection[];
  positions: Record<string, { x: number; y: number }>;
}

export function useBoardEditor(caseId: string, options?: { isMobile?: boolean; checkpoints?: DbCaseCheckpoint[]; characters?: DbCaseCharacter[] }) {
  const boardModel = useBoardModel(caseId, { isMobile: options?.isMobile, initialCheckpoints: options?.checkpoints, initialCharacters: options?.characters });

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [nodes, setNodes] = useState<DbCaseBoardNode[]>([]);
  const [pins, setPins] = useState<PinPoint[]>([]);
  const [connections, setConnections] = useState<CaseConnection[]>([]);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const historyRef = useRef<{
    past: BoardEditorSnapshot[];
    future: BoardEditorSnapshot[];
  }>({ past: [], future: [] });

  // Đồng bộ từ boardModel khi nạp xong hoặc khi refresh
  useEffect(() => {
    if (!boardModel.isLoading) {
      setNodes(boardModel.boardNodes);
      setPins(boardModel.pins);
      setConnections(boardModel.connections);
      setPositions(boardModel.positions);
      setHasUnsavedChanges(false);
    }
  }, [
    boardModel.isLoading,
    boardModel.boardNodes,
    boardModel.pins,
    boardModel.connections,
    boardModel.positions,
  ]);

  const currentSnapshot = useCallback((): BoardEditorSnapshot => ({
    nodes: [...nodes],
    pins: [...pins],
    connections: [...connections],
    positions: { ...positions },
  }), [nodes, pins, connections, positions]);

  const commitSnapshot = useCallback((before: BoardEditorSnapshot) => {
    historyRef.current.past.push(before);
    if (historyRef.current.past.length > 50) historyRef.current.past.shift();
    historyRef.current.future = [];
    setHasUnsavedChanges(true);
  }, []);

  const handleUndo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (!past.length) return;
    const current = currentSnapshot();
    const prev = past.pop()!;
    future.push(current);
    setNodes(prev.nodes);
    setPins(prev.pins);
    setConnections(prev.connections);
    setPositions(prev.positions);
    setHasUnsavedChanges(true);
    toast.info("Đã hoàn tác");
  }, [currentSnapshot]);

  const handleRedo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (!future.length) return;
    const current = currentSnapshot();
    const next = future.pop()!;
    past.push(current);
    setNodes(next.nodes);
    setPins(next.pins);
    setConnections(next.connections);
    setPositions(next.positions);
    setHasUnsavedChanges(true);
    toast.info("Đã làm lại");
  }, [currentSnapshot]);

  const handlePositionChange = useCallback(
    (pinId: string, x: number, y: number) => {
      const snap = currentSnapshot();
      commitSnapshot(snap);

      setPositions((prev) => ({
        ...prev,
        [pinId]: { x, y },
      }));

      // Cập nhật vị trí trong pins (chuẩn hóa vào boardgame_pins: desktop hoặc mobile)
      setPins((prev) =>
        prev.map((pin) => {
          if (pin.id !== pinId) return pin;
          if (options?.isMobile) {
            return { ...pin, mobileX: x, mobileY: y };
          }
          return { ...pin, x, y };
        }),
      );
    },
    [currentSnapshot, commitSnapshot],
  );

  const handleConnectPins = useCallback(
    (fromPinId: string, toPinId: string) => {
      const snap = currentSnapshot();
      commitSnapshot(snap);

      const exists = connections.some(
        (c) =>
          (c.fromPinId === fromPinId && c.toPinId === toPinId) ||
          (c.fromPinId === toPinId && c.toPinId === fromPinId),
      );
      if (exists) return;

      const newConn: CaseConnection = {
        id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fromPinId,
        toPinId,
      };

      setConnections((prev) => [...prev, newConn]);
    },
    [connections, currentSnapshot, commitSnapshot],
  );

  const handleDeleteConnection = useCallback(
    (connId: string) => {
      const snap = currentSnapshot();
      commitSnapshot(snap);
      setConnections((prev) => prev.filter((c) => c.id !== connId));
    },
    [currentSnapshot, commitSnapshot],
  );

  const handleSaveNode = useCallback(
    async (draft: BoardNodeDraft) => {
      try {
        const snap = currentSnapshot();
        commitSnapshot(snap);

        const res = await saveBoardNode(draft);
        if (!res.success) {
          toast.error(res.error || "Lỗi khi lưu node");
          return false;
        }

        toast.success("Đã lưu node thành công");
        if (res.data) {
          setNodes((prev) => {
            const exists = prev.some((n) => n.id === res.data!.id);
            if (exists) {
              return prev.map((n) => (n.id === res.data!.id ? res.data! : n));
            }
            return [...prev, res.data!];
          });
        }
        await boardModel.refresh();
        return true;
      } catch (err: unknown) {
        toast.error("Lỗi khi lưu node");
        return false;
      }
    },
    [currentSnapshot, commitSnapshot, boardModel],
  );

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      try {
        const snap = currentSnapshot();
        commitSnapshot(snap);

        const isCustomPin = pins.some((p) => p.id === nodeId);
        if (isCustomPin) {
          setPins((prev) => prev.filter((p) => p.id !== nodeId));
        } else {
          await deleteBoardNode(nodeId);
          setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        }

        setConnections((prev) =>
          prev.filter((c) => c.fromPinId !== nodeId && c.toPinId !== nodeId),
        );
        setSelectedNodeId(null);
        toast.info("Đã xóa node");
        return true;
      } catch (err: unknown) {
        toast.error("Lỗi khi xóa node");
        return false;
      }
    },
    [pins, currentSnapshot, commitSnapshot],
  );

  const handleSaveAll = useCallback(async () => {
    setIsSaving(true);
    try {
      // 1. Lưu nodes batch (metadata thuần túy, không ghi đè position)
      if (nodes.length > 0) {
        const batchNodes = nodes.map((n) => {
          const cfg = (n.config as any) || {};
          return {
            id: n.id,
            case_slug: n.case_slug,
            node_kind: n.node_kind,
            title: n.title,
            subject_key: n.subject_key,
            checkpoint_id: n.checkpoint_id,
            slot_index: n.slot_index,
            config: cfg,
          };
        });
        await saveBoardNodesBatch(batchNodes);
      }

      // 2. Lưu toàn bộ pins & connections qua saveBoardgamePinPositions (single source of truth for coordinates)
      await saveBoardgamePinPositions(
        caseId,
        pins.map((p) => {
          const currentPos = positions[p.id];
          if (options?.isMobile) {
            return {
              ...p,
              mobileX: currentPos?.x ?? p.mobileX ?? p.x,
              mobileY: currentPos?.y ?? p.mobileY ?? p.y,
            };
          }
          return {
            ...p,
            x: currentPos?.x ?? p.x,
            y: currentPos?.y ?? p.y,
          };
        }),
        connections,
      );

      setHasUnsavedChanges(false);
      historyRef.current = { past: [], future: [] };
      toast.success("Đã lưu toàn bộ bố cục bảng!");
    } catch (err: unknown) {
      console.error("Save all board error:", err);
      toast.error("Lỗi khi lưu bố cục bảng");
    } finally {
      setIsSaving(false);
    }
  }, [caseId, nodes, pins, connections, positions]);

  // Ghép toàn bộ pins hiển thị trên canvas
  const displayPins: PinPoint[] = pins.map((p) => {
    const pos = positions[p.id] || { x: p.x, y: p.y };
    return {
      ...p,
      x: pos.x,
      y: pos.y,
    };
  });

  const selectedNode =
    nodes.find((n) => n.id === selectedNodeId) ||
    pins.find((p) => p.id === selectedNodeId) ||
    displayPins.find((p) => p.id === selectedNodeId) ||
    null;

  return {
    isLoading: boardModel.isLoading,
    isSaving,
    hasUnsavedChanges,
    nodes,
    pins,
    connections,
    positions,
    displayPins,
    selectedNodeId,
    selectedNode,
    setSelectedNodeId,
    refreshBoardModel: boardModel.refresh,
    handleAdjustNodeTransform: (pinId: string, deltaRot: number, deltaScale: number) => {
      const targetNode = nodes.find((n) => n.id === pinId);
      if (targetNode) {
        const snap = currentSnapshot();
        commitSnapshot(snap);
        setNodes((prev) =>
          prev.map((n) => {
            if (n.id !== pinId) return n;
            const cfg = (n.config as any) || {};
            const curRot = cfg.rotation ?? 0;
            const curScale = cfg.scale ?? 1.0;
            return {
              ...n,
              config: {
                ...cfg,
                rotation: Math.round(curRot + deltaRot),
                scale: Math.max(0.4, Math.min(2.5, Math.round((curScale + deltaScale) * 10) / 10)),
              },
            };
          })
        );
        setHasUnsavedChanges(true);
        return;
      }

      const targetPin = pins.find((p) => p.id === pinId);
      if (targetPin) {
        const snap = currentSnapshot();
        commitSnapshot(snap);
        setPins((prev) =>
          prev.map((p) => {
            if (p.id !== pinId) return p;
            const curRot = p.rotation ?? 0;
            const curScale = p.scale ?? 1.0;
            return {
              ...p,
              rotation: Math.round(curRot + deltaRot),
              scale: Math.max(0.4, Math.min(2.5, Math.round((curScale + deltaScale) * 10) / 10)),
            };
          })
        );
        setHasUnsavedChanges(true);
      }
    },
    handlePositionChange,
    handleConnectPins,
    handleDeleteConnection,
    handleSaveNode,
    handleDeleteNode,
    handleSaveAll,
    handleUndo,
    handleRedo,
    canUndo: historyRef.current.past.length > 0,
    canRedo: historyRef.current.future.length > 0,
  };
}
