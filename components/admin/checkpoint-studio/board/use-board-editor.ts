"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PinPoint,
  CaseConnection,
} from "@/components/investigation/board/renderer/hero-interactive";
import type { DbCaseBoardNode, DbCaseCheckpoint, DbCaseCharacter, BoardConfig } from "@/lib/types/database";
import {
  saveBoardNode,
  deleteBoardNode,
  saveBoardNodesBatch,
  saveBoardgamePinPositions,
  type BoardNodeDraft,
} from "@/lib/actions/board-actions";
import { useBoardModel } from "@/components/investigation/board/canvas/use-board-model";
import { toast } from "@/components/ui/toast";

export interface BoardEditorSnapshot {
  nodes: DbCaseBoardNode[];
  pins: PinPoint[];
  connections: CaseConnection[];
  positions: Record<string, { x: number; y: number }>;
}

export function useBoardEditor(caseId: string, options?: { isMobile?: boolean; checkpoints?: DbCaseCheckpoint[]; characters?: DbCaseCharacter[] }) {
  const boardModel = useBoardModel(caseId, { isMobile: options?.isMobile, initialCheckpoints: options?.checkpoints, initialCharacters: options?.characters, isStudioMode: true });

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

  // Đồng bộ từ boardModel khi nạp xong hoặc khi có cập nhật live từ Checkpoint Studio
  useEffect(() => {
    if (!boardModel.isLoading) {
      if (!hasUnsavedChanges) {
        setNodes(boardModel.boardNodes);
        setPins(boardModel.pins);
        setConnections(boardModel.connections);
        setPositions(boardModel.positions);
        setHasUnsavedChanges(false);
      } else {
        // Khi đang có thay đổi chưa lưu trên bảng (ví dụ vừa kéo thả pin hoặc sửa node),
        // vẫn đồng bộ live các thuộc tính nội dung (nhãn, màu, ẩn/hiện, tiêu đề) từ boardModel.pins cho CHECKPOINT,
        // nhưng bảo lưu toàn bộ chỉnh sửa cục bộ của BOARD NODES trong prevPins
        setPins((prevPins) => {
          return prevPins.map((existing) => {
            const modelPin = boardModel.pins.find((p) => p.id === existing.id);
            if (!modelPin) return existing;

            const isCheckpoint = Boolean(
              existing.checkpointId ||
                modelPin.checkpointId ||
                existing.id.includes("checkpoint") ||
                existing.id.includes("phone_lookup") ||
                existing.id.includes("indictment") ||
                existing.id.includes("epilogue") ||
                existing.id.includes(":suspect:") ||
                existing.id.includes(":followup:"),
            );

            if (isCheckpoint) {
              return {
                ...existing,
                ...modelPin,
                x: existing.x,
                y: existing.y,
                rotation:
                  typeof existing.rotation === "number"
                    ? existing.rotation
                    : modelPin.rotation,
                scale:
                  typeof existing.scale === "number" && existing.scale > 0
                    ? existing.scale
                    : modelPin.scale,
                zIndex:
                  typeof existing.zIndex === "number"
                    ? existing.zIndex
                    : modelPin.zIndex,
              };
            }
            return existing;
          });
        });
      }
    }
  }, [
    boardModel.isLoading,
    boardModel.boardNodes,
    boardModel.pins,
    boardModel.connections,
    boardModel.positions,
    hasUnsavedChanges,
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
  const displayPins: PinPoint[] = useMemo(() => {
    return pins.map((p) => {
      const modelPin = boardModel.pins.find((mp) => mp.id === p.id);
      const isCheckpoint = Boolean(
        p.checkpointId ||
          modelPin?.checkpointId ||
          p.id.includes("checkpoint") ||
          p.id.includes("phone_lookup") ||
          p.id.includes("indictment") ||
          p.id.includes("epilogue") ||
          p.id.includes(":suspect:") ||
          p.id.includes(":followup:"),
      );

      let merged: PinPoint;
      if (isCheckpoint && modelPin) {
        // Với checkpoint: modelPin phản ánh tức thì từ draft trong Inspector qua liveRows
        merged = {
          ...p,
          ...modelPin,
          x: p.x,
          y: p.y,
          rotation: typeof modelPin.rotation === "number" ? modelPin.rotation : p.rotation,
          scale: typeof modelPin.scale === "number" && modelPin.scale > 0 ? modelPin.scale : p.scale,
          zIndex: typeof modelPin.zIndex === "number" ? modelPin.zIndex : p.zIndex,
        };
      } else if (modelPin) {
        // Với board node (như suspects_hub, reinvestigate, custom node):
        // p chứa các giá trị người dùng vừa sửa ở BoardNodeForm (noteColor, pinColor, title, scale, rotation)
        // modelPin chỉ là dữ liệu ban đầu từ DB -> p PHẢI ĐÈ LÊN modelPin!
        merged = {
          ...modelPin,
          ...p,
        };
      } else {
        merged = p;
      }

      const pos = positions[merged.id] || { x: merged.x, y: merged.y };
      return {
        ...merged,
        x: pos.x,
        y: pos.y,
      };
    });
  }, [pins, boardModel.pins, positions]);

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
      // Tìm target trong nodes hoặc pins (khớp id, legacyId, checkpointId)
      const targetNode = nodes.find(
        (n) => n.id === pinId || n.checkpoint_id === pinId || (pinId && n.id.includes(pinId)),
      );
      const targetPin = pins.find(
        (p) =>
          p.id === pinId ||
          p.legacyId === pinId ||
          p.checkpointId === pinId ||
          (pinId && (p.id.includes(pinId) || pinId.includes(p.id))),
      );

      if (!targetNode && !targetPin) return;

      const snap = currentSnapshot();
      commitSnapshot(snap);

      const curRot =
        typeof targetPin?.rotation === "number"
          ? targetPin.rotation
          : typeof (targetNode?.config as any)?.rotation === "number"
            ? (targetNode?.config as any).rotation
            : 0;

      const curScale =
        typeof targetPin?.scale === "number" && targetPin.scale > 0
          ? targetPin.scale
          : typeof (targetNode?.config as any)?.scale === "number" && (targetNode?.config as any).scale > 0
            ? (targetNode?.config as any).scale
            : 1.0;

      const nextRot = Math.round(curRot + deltaRot);
      const nextScale = Math.max(0.4, Math.min(2.5, Math.round((curScale + deltaScale) * 10) / 10));

      if (targetNode) {
        setNodes((prev) =>
          prev.map((n) => {
            const isMatch = n.id === pinId || n.checkpoint_id === pinId || n.id === targetNode.id;
            if (!isMatch) return n;
            const cfg = (n.config as any) || {};
            return {
              ...n,
              config: {
                ...cfg,
                rotation: nextRot,
                scale: nextScale,
              },
            };
          }),
        );
      }

      setPins((prev) =>
        prev.map((p) => {
          const isMatch =
            p.id === pinId ||
            p.legacyId === pinId ||
            p.checkpointId === pinId ||
            (targetPin && p.id === targetPin.id) ||
            (targetNode && (p.id === targetNode.id || p.checkpointId === targetNode.checkpoint_id));
          if (!isMatch) return p;
          return {
            ...p,
            rotation: nextRot,
            scale: nextScale,
          };
        }),
      );
      setHasUnsavedChanges(true);
    },
    handleAdjustNodeZIndex: (pinId: string, deltaZ: number) => {
      const snap = currentSnapshot();
      commitSnapshot(snap);

      setPins((prev) =>
        prev.map((p) => {
          const isMatch =
            p.id === pinId ||
            p.legacyId === pinId ||
            p.checkpointId === pinId ||
            (pinId && (p.id.includes(pinId) || pinId.includes(p.id)));
          if (!isMatch) return p;
          const currentZ = p.zIndex ?? 0;
          return {
            ...p,
            zIndex: currentZ + deltaZ,
          };
        }),
      );
      setHasUnsavedChanges(true);
    },
    handleUpdateNodeLocal: (nodeId: string, patch: { title?: string; config?: Partial<BoardConfig> }) => {
      setNodes((prev) =>
        prev.map((n) => {
          const isMatch = n.id === nodeId || (nodeId && n.id.includes(nodeId));
          if (!isMatch) return n;
          return {
            ...n,
            title: patch.title !== undefined ? patch.title : n.title,
            config: {
              ...((n.config as any) || {}),
              ...(patch.config || {}),
            },
          };
        }),
      );

      setPins((prev) =>
        prev.map((p) => {
          const isMatch =
            p.id === nodeId ||
            p.checkpointId === nodeId ||
            (nodeId && (p.id.includes(nodeId) || nodeId.includes(p.id))) ||
            (p.subjectKey && nodeId && (
              nodeId.toLowerCase().endsWith(`-${p.subjectKey.toLowerCase()}`) ||
              nodeId.toLowerCase().endsWith(`:${p.subjectKey.toLowerCase()}`) ||
              nodeId.toLowerCase().includes(`:${p.subjectKey.toLowerCase()}:`) ||
              nodeId.toLowerCase().includes(`-${p.subjectKey.toLowerCase()}-`)
            )) ||
            (p.nodeKind === "suspects_hub" && nodeId === "suspects_hub") ||
            (p.nodeKind === "reinvestigate" && nodeId === "reinvestigate");
          if (!isMatch) return p;
          const cfg = patch.config || {};
          return {
            ...p,
            label: cfg.pin_title ?? patch.title ?? p.label,
            noteColor: (cfg.note_color as any) ?? p.noteColor,
            pinColor: (cfg.pin_color as any) ?? p.pinColor,
            displayMode: (cfg.display_mode as any) ?? p.displayMode,
            hasPin: cfg.has_pin !== undefined ? cfg.has_pin : p.hasPin,
            rotation: cfg.rotation !== undefined ? cfg.rotation : p.rotation,
            scale: cfg.scale !== undefined ? cfg.scale : p.scale,
            zIndex: cfg.z_index !== undefined ? cfg.z_index : p.zIndex,
            photoUrl: cfg.photo_url !== undefined ? (cfg.photo_url || undefined) : p.photoUrl,
            isPolaroid: cfg.is_polaroid !== undefined ? cfg.is_polaroid : p.isPolaroid,
            textScale: cfg.text_scale !== undefined ? cfg.text_scale : p.textScale,
          };
        }),
      );
      setHasUnsavedChanges(true);
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
