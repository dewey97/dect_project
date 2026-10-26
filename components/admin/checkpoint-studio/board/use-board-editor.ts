"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PinPoint,
  CaseConnection,
} from "@/components/investigation/hero-interactive";
import type { DbCaseBoardNode } from "@/lib/types/database";
import {
  getBoardNodes,
  saveBoardNode,
  deleteBoardNode,
  saveBoardNodesBatch,
  saveBoardgamePinPositions,
  getBoardgamePinPositions,
  type BoardNodeDraft,
} from "@/lib/actions/board-actions";
import { toast } from "@/components/ui/toast";

export interface BoardEditorSnapshot {
  nodes: DbCaseBoardNode[];
  pins: PinPoint[];
  connections: CaseConnection[];
  positions: Record<string, { x: number; y: number }>;
}

export function useBoardEditor(caseId: string) {
  const [isLoading, setIsLoading] = useState(true);
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

  const currentSnapshot = useCallback((): BoardEditorSnapshot => ({
    nodes: [...nodes],
    pins: [...pins],
    connections: [...connections],
    positions: { ...positions },
  }), [nodes, pins, connections, positions]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nodesRes, boardgameRes] = await Promise.all([
        getBoardNodes(caseId),
        getBoardgamePinPositions(caseId),
      ]);

      const loadedNodes = nodesRes.success ? nodesRes.data : [];
      setNodes(loadedNodes);

      // Loại bỏ các pin trùng ID với node từ bảng case_board_nodes để tránh bị vẽ đè 2 lần
      const nodeIds = new Set(loadedNodes.map((n) => n.id));
      const loadedPins: PinPoint[] = boardgameRes.success
        ? boardgameRes.pins
            .filter((p) => !nodeIds.has(p.id))
            .map((p) => ({
              id: p.id,
              nodeKind: "custom",
              x: p.x,
              y: p.y,
              label: p.label || p.id,
              detail: p.detail || "",
              photoUrl: p.photoUrl || undefined,
              noteColor: (p.noteColor as any) || "white",
              pinColor: (p.pinColor as any) || "red",
              scale: p.scale ?? 1.0,
              rotation: p.rotation ?? 0,
            }))
        : [];
      setPins(loadedPins);

      const posMap: Record<string, { x: number; y: number }> = {};
      loadedNodes.forEach((n) => {
        const pos = (n.config as any)?.position?.desktop;
        if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
          posMap[n.id] = { x: pos.x, y: pos.y };
        }
      });
      loadedPins.forEach((p) => {
        posMap[p.id] = { x: p.x, y: p.y };
      });
      setPositions(posMap);

      const loadedConns: CaseConnection[] = boardgameRes.success && boardgameRes.connections
        ? boardgameRes.connections.map((c) => ({
            id: c.id,
            fromPinId: c.fromPinId,
            toPinId: c.toPinId,
          }))
        : [];
      setConnections(loadedConns);

      historyRef.current = { past: [], future: [] };
      setHasUnsavedChanges(false);
    } catch (err: unknown) {
      console.error("Failed to load board editor data:", err);
      toast.error("Không thể tải dữ liệu bảng điều tra");
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

      // Cập nhật vị trí trong nodes nếu là board node
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id !== pinId) return node;
          const cfg = (node.config as any) || {};
          const currentPos = cfg.position || {};
          return {
            ...node,
            config: {
              ...cfg,
              position: {
                ...currentPos,
                desktop: { x, y },
                mobile: currentPos.mobile || { x, y },
              },
            },
          };
        }),
      );

      // Cập nhật vị trí trong pins nếu là custom pin
      setPins((prev) =>
        prev.map((pin) => (pin.id === pinId ? { ...pin, x, y } : pin)),
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
        await loadData();
        return true;
      } catch (err: unknown) {
        toast.error("Lỗi khi lưu node");
        return false;
      }
    },
    [currentSnapshot, commitSnapshot, loadData],
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
      // 1. Lưu nodes batch
      if (nodes.length > 0) {
        const batchNodes = nodes.map((n) => {
          const currentPos = positions[n.id];
          const cfg = (n.config as any) || {};
          return {
            id: n.id,
            case_slug: n.case_slug,
            node_kind: n.node_kind,
            title: n.title,
            subject_key: n.subject_key,
            checkpoint_id: n.checkpoint_id,
            slot_index: n.slot_index,
            config: currentPos
              ? {
                  ...cfg,
                  position: {
                    ...cfg.position,
                    desktop: currentPos,
                    mobile: cfg.position?.mobile || currentPos,
                  },
                }
              : cfg,
          };
        });
        await saveBoardNodesBatch(batchNodes);
      }

      // 2. Lưu pins & connections qua saveBoardgamePinPositions
      await saveBoardgamePinPositions(
        caseId,
        pins.map((p) => ({
          ...p,
          x: positions[p.id]?.x ?? p.x,
          y: positions[p.id]?.y ?? p.y,
        })),
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
  const displayPins: PinPoint[] = [
    ...nodes.map((n) => {
      const cfg = (n.config as any) || {};
      const pos = positions[n.id] || cfg.position?.desktop || { x: 0.5, y: 0.5 };
      return {
        id: n.id,
        nodeKind: n.node_kind as any,
        subjectKey: n.subject_key || undefined,
        checkpointId: n.checkpoint_id || undefined,
        x: pos.x,
        y: pos.y,
        label: cfg.pin_title || n.title || n.id,
        detail: n.title || "",
        photoUrl: cfg.photo_url || undefined,
        scale: cfg.scale ?? 1.0,
        rotation: cfg.rotation ?? 0,
        noteColor: (cfg.note_style ? "white" : undefined) as "white" | undefined,
      };
    }),
    ...pins.map((p) => {
      const pos = positions[p.id] || { x: p.x, y: p.y };
      return {
        ...p,
        x: pos.x,
        y: pos.y,
      };
    }),
  ];

  const selectedNode =
    nodes.find((n) => n.id === selectedNodeId) ||
    pins.find((p) => p.id === selectedNodeId) ||
    null;

  return {
    isLoading,
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
