"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  type OnNodeDrag,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { AlertTriangle, FolderOpen, Layers, Sparkles } from "lucide-react";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import {
  buildDependencyEdges,
  getCheckpointIssues,
  layoutCheckpointGraph,
  wouldCreateCycle,
} from "@/lib/cms/checkpoint-graph";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── 1. Node Data & Component ──

interface CheckpointNodeData extends Record<string, unknown> {
  row: DbCaseCheckpoint;
  isSelected: boolean;
  issueLabels: string[];
  onSelect?: () => void;
}

// Hàm tự động xác định handle tối ưu ngắn nhất (Trên/Dưới/Trái/Phải) dựa theo tọa độ 2 node
function getOptimalHandles(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
  nodeWidth = 220,
  nodeHeight = 70,
) {
  const sourceCenter = {
    x: sourcePos.x + nodeWidth / 2,
    y: sourcePos.y + nodeHeight / 2,
  };
  const targetCenter = {
    x: targetPos.x + nodeWidth / 2,
    y: targetPos.y + nodeHeight / 2,
  };

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  if (dx === 0 && dy === 0) {
    return { sourceHandle: "source-right", targetHandle: "target-left" };
  }

  // Nhận diện hướng dọc nhạy hơn: nếu dy đáng kể so với dx -> nối đỉnh/đáy thẳng tắp
  const isVertical = Math.abs(dy) >= Math.abs(dx) * 0.6;

  if (isVertical) {
    if (dy > 0) {
      // Target nằm phía DƯỚI Source
      return { sourceHandle: "source-bottom", targetHandle: "target-top" };
    } else {
      // Target nằm phía TRÊN Source
      return { sourceHandle: "source-top", targetHandle: "target-bottom" };
    }
  } else {
    if (dx > 0) {
      // Target nằm bên PHẢI Source
      return { sourceHandle: "source-right", targetHandle: "target-left" };
    } else {
      // Target nằm bên TRÁI Source
      return { sourceHandle: "source-left", targetHandle: "target-right" };
    }
  }
}

type CheckpointFlowNode = Node<CheckpointNodeData, "checkpoint">;

function CheckpointFlowNodeCard({
  data,
  selected,
}: NodeProps<CheckpointFlowNode>) {
  const { row, issueLabels, isSelected, onSelect } = data;
  const active = selected || isSelected;

  const isEpilogue =
    row.kind === "epilogue" ||
    row.type === "epilogue" ||
    row.checkpoint_id.includes("epilogue");

  const kindLabel = useMemo(() => {
    const k = row.kind || row.type || "picker";
    switch (k) {
      case "code":
      case "time":
        return "So khớp";
      case "choice":
        return "Trắc nghiệm";
      case "text":
        return "Tự do";
      case "phone_lookup":
        return "Tra SĐT";
      case "suspect_interrogation":
      case "suspect":
        return "Thẩm tra";
      case "followup":
        return "Nghi vấn";
      case "indictment":
        return "Cáo trạng";
      case "epilogue":
        return "Hậu án";
      case "evidence_picker":
      default:
        return "Tài liệu";
    }
  }, [row.kind, row.type]);

  const kindColor = useMemo(() => {
    const k = row.kind || row.type || "picker";
    switch (k) {
      case "code":
      case "time":
        return "bg-teal-500/10 text-teal-300 border-teal-500/30";
      case "phone_lookup":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      case "suspect_interrogation":
      case "suspect":
        return "bg-blue-500/10 text-blue-300 border-blue-500/30";
      case "followup":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "indictment":
        return "bg-rose-500/10 text-rose-300 border-rose-500/30";
      case "epilogue":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
    }
  }, [row.kind, row.type]);

  const hintCount = Array.isArray(row.hints) ? row.hints.length : 0;
  const unlockedDossier =
    typeof (row.answer_config as any)?.unlocksDossier === "string" &&
    (row.answer_config as any).unlocksDossier.trim()
      ? (row.answer_config as any).unlocksDossier.trim()
      : null;

  return (
    <div
      onClick={() => onSelect?.()}
      className={cn(
        "w-[220px] rounded-xl border p-2.5 shadow-xl transition-all cursor-pointer select-none",
        active
          ? "border-purple-400 bg-[#161224] ring-2 ring-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
          : "border-white/10 bg-[#101016] hover:border-white/25 hover:bg-[#14141c]",
      )}
    >
      {/* ── Handles Đa Hướng (Ẩn hoàn toàn - Nối bằng dropdown Phụ thuộc, vị trí 50% ở mỗi mép) ── */}
      {/* Target Handles (Điểm đến phụ thuộc) */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        style={{ top: "50%" }}
        className="!opacity-0 !pointer-events-none !size-0 !border-0"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="target-right"
        style={{ top: "50%" }}
        className="!opacity-0 !pointer-events-none !size-0 !border-0"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        style={{ left: "50%" }}
        className="!opacity-0 !pointer-events-none !size-0 !border-0"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="target-bottom"
        style={{ left: "50%" }}
        className="!opacity-0 !pointer-events-none !size-0 !border-0"
      />

      {/* Source Handles (Điểm nguồn mở khóa) */}
      <Handle
        type="source"
        position={Position.Left}
        id="source-left"
        style={{ top: "50%" }}
        className="!opacity-0 !pointer-events-none !size-0 !border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        style={{ top: "50%" }}
        className="!opacity-0 !pointer-events-none !size-0 !border-0"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="source-top"
        style={{ left: "50%" }}
        className="!opacity-0 !pointer-events-none !size-0 !border-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        style={{ left: "50%" }}
        className="!opacity-0 !pointer-events-none !size-0 !border-0"
      />

      {/* Header: Kind Badge + Unlocked Dossier Badge (Chỉ hiển thị khi node mở khóa bộ hồ sơ) */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1 min-w-0">
          <span
            className={cn(
              "rounded border px-1 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide shrink-0",
              kindColor,
            )}
          >
            {kindLabel}
          </span>
          {unlockedDossier && (
            <span
              title={`Mở khóa bộ hồ sơ: ${unlockedDossier}`}
              className="rounded bg-purple-500/20 border border-purple-500/40 px-1 py-0.5 font-mono text-[9px] font-semibold text-purple-300 flex items-center gap-1 truncate"
            >
              <FolderOpen className="size-2.5 shrink-0" />
              <span className="truncate">{unlockedDossier}</span>
            </span>
          )}
        </div>

        {issueLabels.length > 0 && (
          <span
            title={issueLabels.join(" · ")}
            className="flex size-4 items-center justify-center rounded-full bg-rose-500/20 text-[9px] font-bold text-rose-300"
          >
            !
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-sans text-xs font-bold text-zinc-100 line-clamp-1">
        {row.title || "Chưa đặt tiêu đề"}
      </h4>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  checkpoint: CheckpointFlowNodeCard,
};

// ── 2. Flow View Component ──

export interface CheckpointFlowViewProps {
  rows: DbCaseCheckpoint[];
  selectedId: string | null;
  onSelectCheckpoint: (cp: DbCaseCheckpoint) => void;
  onCreateCheckpoint?: () => void;
  onConnectDependencies?: (sourceId: string, targetId: string) => void;
  onDeleteDependency?: (sourceId: string, targetId: string) => void;
  onNodePositionChange?: (
    checkpointId: string,
    position: { x: number; y: number },
  ) => void;
  className?: string;
}

export function CheckpointFlowView({
  rows,
  selectedId,
  onSelectCheckpoint,
  onCreateCheckpoint,
  onConnectDependencies,
  onDeleteDependency,
  onNodePositionChange,
  className,
}: CheckpointFlowViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<CheckpointFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const flowRef = useRef<ReactFlowInstance<CheckpointFlowNode, Edge> | null>(null);

  // Danh sách lỗi linter
  const issueMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const row of rows) {
      map.set(
        row.checkpoint_id,
        getCheckpointIssues(row, rows).map((i) => i.label),
      );
    }
    return map;
  }, [rows]);

  // Sắp xếp bố cục DAG phân tầng
  const handleAutoLayout = useCallback(() => {
    const dependencyEdges = buildDependencyEdges(rows);
    const layout = layoutCheckpointGraph(rows, dependencyEdges);
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        const targetPos = layout[n.id];
        if (targetPos) {
          return {
            ...n,
            position: { x: targetPos.x, y: targetPos.y },
          };
        }
        return n;
      }),
    );
    setTimeout(() => {
      flowRef.current?.fitView({ padding: 0.2, duration: 400 });
    }, 50);
  }, [rows, setNodes]);

  // Đồng bộ nodes từ rows (giữ vị trí đã kéo trên canvas)
  useEffect(() => {
    const dependencyEdges = buildDependencyEdges(rows);
    const layout = layoutCheckpointGraph(rows, dependencyEdges);
    setNodes((prevNodes) => {
      const prevPosMap = new Map(prevNodes.map((n) => [n.id, n.position]));
      return rows.map((row) => {
        const existingPos = prevPosMap.get(row.checkpoint_id);
        const pos =
          existingPos ||
          (row.flow_position && typeof row.flow_position === "object"
            ? (row.flow_position as { x: number; y: number })
            : layout[row.checkpoint_id] || { x: 50, y: 50 });

        const isCurrentSelected =
          selectedId === row.id || selectedId === row.checkpoint_id;

        return {
          id: row.checkpoint_id,
          type: "checkpoint",
          position: pos,
          data: {
            row,
            isSelected: isCurrentSelected,
            issueLabels: issueMap.get(row.checkpoint_id) || [],
            onSelect: () => onSelectCheckpoint(row),
          },
        };
      });
    });
  }, [rows, selectedId, issueMap, setNodes, onSelectCheckpoint]);

  // Xử lý khi nhả chuột sau khi kéo di chuyển node
  const handleNodeDragStop: OnNodeDrag<CheckpointFlowNode> = useCallback(
    (_event, node) => {
      const pos = {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      };
      onNodePositionChange?.(node.id, pos);
    },
    [onNodePositionChange],
  );

  // Đồng bộ edges từ depends_on và tự động chọn điểm nối ngắn nhất (4 hướng: Trên/Dưới/Trái/Phải)
  useEffect(() => {
    const dependencyEdges = buildDependencyEdges(rows);
    const nodePosMap = new Map(nodes.map((n) => [n.id, n.position]));

    const newEdges: Edge[] = dependencyEdges.map((e) => {
      const id = `dep:${e.source}->${e.target}`;
      const sourcePos = nodePosMap.get(e.source) || { x: 0, y: 0 };
      const targetPos = nodePosMap.get(e.target) || { x: 0, y: 0 };

      const optimal = getOptimalHandles(sourcePos, targetPos);

      return {
        id,
        source: e.source,
        target: e.target,
        sourceHandle: optimal.sourceHandle,
        targetHandle: optimal.targetHandle,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#a855f7", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#a855f7",
          width: 14,
          height: 14,
        },
      };
    });

    setEdges(newEdges);
  }, [rows, nodes, setEdges]);

  // Kéo nối quan hệ phụ thuộc mới
  const handleConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target) return;
      if (conn.source === conn.target) return;
      if (onConnectDependencies) {
        onConnectDependencies(conn.source, conn.target);
      }
    },
    [onConnectDependencies],
  );

  // Xóa dây nối phụ thuộc khi click hoặc delete
  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (edge.id.startsWith("dep:")) {
        const parts = edge.id.replace("dep:", "").split("->");
        if (parts.length === 2 && onDeleteDependency) {
          onDeleteDependency(parts[0], parts[1]);
        }
      }
    },
    [onDeleteDependency],
  );

  // Chọn node
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const matched = rows.find(
        (r) => r.checkpoint_id === node.id || r.id === node.id,
      );
      if (matched) {
        onSelectCheckpoint(matched);
      }
    },
    [rows, onSelectCheckpoint],
  );

  return (
    <div className={cn("flex flex-col h-full w-full bg-[#0d0d12] relative overflow-hidden", className)}>
      {/* Canvas React Flow */}
      <div className="flex-1 min-h-0 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          onConnect={handleConnect}
          onEdgeClick={handleEdgeClick}
          onNodeClick={handleNodeClick}
          onInit={(inst) => {
            flowRef.current = inst;
            setTimeout(() => {
              inst.fitView({ padding: 0.15 });
            }, 100);
          }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="bg-[#0d0d12]"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1.2}
            color="#272736"
          />
          </ReactFlow>
      </div>
    </div>
  );
}
