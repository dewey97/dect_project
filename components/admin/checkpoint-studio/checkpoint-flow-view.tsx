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
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { AlertTriangle, Layers, Sparkles } from "lucide-react";
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
}

type CheckpointFlowNode = Node<CheckpointNodeData, "checkpoint">;

function CheckpointFlowNodeCard({
  data,
  selected,
}: NodeProps<CheckpointFlowNode>) {
  const { row, issueLabels, isSelected } = data;
  const active = selected || isSelected;

  const isEpilogue =
    row.kind === "epilogue" ||
    row.type === "epilogue" ||
    row.checkpoint_id.includes("epilogue");

  const kindLabel = useMemo(() => {
    const k = row.kind || row.type || "picker";
    switch (k) {
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
      default:
        return "Chứng cứ";
    }
  }, [row.kind, row.type]);

  const kindColor = useMemo(() => {
    const k = row.kind || row.type || "picker";
    switch (k) {
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

  return (
    <div
      className={cn(
        "w-[220px] rounded-xl border p-2.5 shadow-xl transition-all cursor-pointer select-none",
        active
          ? "border-purple-400 bg-[#161224] ring-2 ring-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
          : "border-white/10 bg-[#101016] hover:border-white/25 hover:bg-[#14141c]",
      )}
    >
      {/* Target handle (điểm đến của quan hệ phụ thuộc depends_on) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2.5 !bg-purple-400 !border-2 !border-[#101016]"
        title="Đầu vào phụ thuộc (Target)"
      />

      {/* Header: Dossier + Kind Badge */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1">
          <span className="rounded bg-white/5 border border-white/10 px-1 py-0.5 font-mono text-[9px] font-semibold text-zinc-300">
            {row.dossier || "Mặc định"}
          </span>
          <span
            className={cn(
              "rounded border px-1 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide",
              kindColor,
            )}
          >
            {kindLabel}
          </span>
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

      {/* Source handle (điểm nguồn mở khóa sang node khác) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !bg-amber-400 !border-2 !border-[#101016]"
        title="Đầu ra mở khóa (Source)"
      />
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
  className?: string;
}

export function CheckpointFlowView({
  rows,
  selectedId,
  onSelectCheckpoint,
  onCreateCheckpoint,
  onConnectDependencies,
  onDeleteDependency,
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

  // Đồng bộ nodes từ rows
  useEffect(() => {
    const dependencyEdges = buildDependencyEdges(rows);
    const layout = layoutCheckpointGraph(rows, dependencyEdges);
    const newNodes: CheckpointFlowNode[] = rows.map((row) => {
      const pos =
        row.flow_position && typeof row.flow_position === "object"
          ? (row.flow_position as { x: number; y: number })
          : layout[row.checkpoint_id] || { x: 50, y: 50 };

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
        },
      };
    });

    setNodes(newNodes);
  }, [rows, selectedId, issueMap, setNodes]);

  // Đồng bộ edges từ depends_on
  useEffect(() => {
    const dependencyEdges = buildDependencyEdges(rows);
    const newEdges: Edge[] = dependencyEdges.map((e) => {
      const id = `dep:${e.source}->${e.target}`;
      return {
        id,
        source: e.source,
        target: e.target,
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
  }, [rows, setEdges]);

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
      const matched = rows.find((r) => r.checkpoint_id === node.id);
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
