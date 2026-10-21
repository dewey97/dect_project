"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  type OnNodesChange,
  type ReactFlowInstance,
  useNodesState,
} from "@xyflow/react";
import {
  ArrowRight,
  GitBranch,
  LayoutGrid,
  Link2,
  Loader2,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import type { CheckpointFlowPosition } from "@/lib/types/checkpoint-studio";
import type { CheckpointGraphEdge } from "@/lib/cms/checkpoint-graph";
import {
  getCheckpointIssues,
  layoutCheckpointGraph,
} from "@/lib/cms/checkpoint-graph";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CheckpointFlowViewProps {
  rows: DbCaseCheckpoint[];
  selectedId: string | null;
  pendingEdges: CheckpointGraphEdge[];
  suggestions: CheckpointGraphEdge[];
  flowDirty: boolean;
  isSaving: boolean;
  onSelect: (row: DbCaseCheckpoint) => void;
  onCreate: () => void;
  onAddEdge: (source: string, target: string) => void;
  onDeleteEdge: (source: string, target: string) => void;
  onApplySuggestions: () => void;
  onNodePositionChange: (
    checkpointId: string,
    position: CheckpointFlowPosition,
  ) => void;
  onSaveFlow: () => void;
}

interface CheckpointNodeData extends Record<string, unknown> {
  row: DbCaseCheckpoint;
  issueLabels: string[];
  hintCount: number;
  evidenceCount: number;
  isSelected: boolean;
}

type CheckpointFlowNode = Node<CheckpointNodeData, "checkpoint">;

interface DossierLaneData extends Record<string, unknown> {
  label: string;
  count: number;
}

type DossierLaneNode = Node<DossierLaneData, "dossierLane">;
type CheckpointCanvasNode = CheckpointFlowNode | DossierLaneNode;

const EVIDENCE_KEYS = [
  "validSuspects",
  "validMotives",
  "requiredEvidenceIds",
  "optionalEvidenceIds",
  "motiveEvidenceIds",
  "optionalMotiveIds",
  "alibiEvidenceIds",
  "optionalAlibiIds",
  "contradictionEvidenceIds",
  "optionalContradictionIds",
];

function readCount(
  config: Record<string, unknown> | null | undefined,
  key: string,
): number {
  const value = config?.[key];
  if (!Array.isArray(value)) return 0;
  return value.filter((item) => typeof item === "string" && item.trim()).length;
}

function evidenceCount(row: DbCaseCheckpoint): number {
  return EVIDENCE_KEYS.reduce(
    (total, key) => total + readCount(row.answer_config, key),
    0,
  );
}

function hintCount(row: DbCaseCheckpoint): number {
  return Array.isArray(row.hints) ? row.hints.length : 0;
}

function CheckpointFlowNodeCard({
  data,
  selected,
}: NodeProps<CheckpointFlowNode>) {
  const { row, issueLabels, hintCount: hints, evidenceCount: evidences } = data;
  const active = selected || data.isSelected;
  const readOnly = row.type !== "evidence_picker";

  return (
    <div
      className={cn(
        "w-[260px] rounded-xl border bg-[#101014] p-3 shadow-xl transition-colors",
        active
          ? "border-amber-400/70 ring-2 ring-amber-400/20"
          : "border-white/10 hover:border-white/25",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          background: "#a1a1aa",
          border: "2px solid #101014",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          background: "#fbbf24",
          border: "2px solid #101014",
        }}
      />

      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide",
            readOnly
              ? "bg-sky-500/10 text-sky-300"
              : "bg-amber-500/10 text-amber-300",
          )}
        >
          {row.type || "evidence_picker"}
        </span>
        {issueLabels.length > 0 && (
          <span
            title={issueLabels.join(" · ")}
            className="ml-auto flex size-4 items-center justify-center rounded-full bg-red-500/15 text-[9px] font-bold text-red-300"
          >
            {issueLabels.length}
          </span>
        )}
      </div>

      <p className="mt-2 truncate font-mono text-[10px] text-zinc-500">
        {row.node_id?.trim() || row.checkpoint_id}
      </p>
      <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug text-zinc-100">
        {row.title || "(Chưa có tiêu đề)"}
      </p>

      <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
        <span>{hints} gợi ý</span>
        <span className="text-zinc-700">·</span>
        <span>{evidences} mã chứng cứ</span>
        {readOnly && <span className="ml-auto text-sky-400/70">chỉ đọc</span>}
      </div>
    </div>
  );
}

function DossierLaneCard({ data }: NodeProps<DossierLaneNode>) {
  return (
    <div className="h-full w-full rounded-2xl border border-dashed border-white/15 bg-white/[0.015] px-4 py-3">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          {data.label}
        </span>
        <span className="text-[10px] text-zinc-600">
          {data.count} checkpoint
        </span>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  checkpoint: CheckpointFlowNodeCard,
  dossierLane: DossierLaneCard,
};

function edgeId(edge: CheckpointGraphEdge): string {
  return `dep:${edge.source}->${edge.target}`;
}

function suggestionId(edge: CheckpointGraphEdge): string {
  return `suggest:${edge.source}->${edge.target}`;
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function CheckpointFlowView({
  rows,
  selectedId,
  pendingEdges,
  suggestions,
  flowDirty,
  isSaving,
  onSelect,
  onCreate,
  onAddEdge,
  onDeleteEdge,
  onApplySuggestions,
  onNodePositionChange,
  onSaveFlow,
}: CheckpointFlowViewProps) {
  const isDesktop = useIsDesktop();
  const flowRef = useRef<ReactFlowInstance<CheckpointCanvasNode, Edge> | null>(
    null,
  );
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<CheckpointFlowNode>(
    [],
  );

  const issueMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const row of rows) {
      map.set(
        row.checkpoint_id,
        getCheckpointIssues(row, rows).map((issue) => issue.label),
      );
    }
    return map;
  }, [rows]);

  useEffect(() => {
    const layout = layoutCheckpointGraph(rows, pendingEdges);
    setNodes((current) => {
      const previous = new Map(current.map((node) => [node.id, node]));
      return rows.map((row) => {
        const existing = previous.get(row.checkpoint_id);
        const saved = row.flow_position;
        const savedPosition =
          saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)
            ? saved
            : null;
        return {
          id: row.checkpoint_id,
          type: "checkpoint" as const,
          position: existing?.position ??
            savedPosition ??
            layout[row.checkpoint_id] ?? { x: 0, y: 0 },
          data: {
            row,
            issueLabels: issueMap.get(row.checkpoint_id) ?? [],
            hintCount: hintCount(row),
            evidenceCount: evidenceCount(row),
            isSelected: row.id === selectedId,
          },
          selected: row.id === selectedId,
          zIndex: 1,
        };
      });
    });
  }, [rows, pendingEdges, selectedId, issueMap, setNodes]);

  const laneNodes = useMemo<DossierLaneNode[]>(() => {
    const groups = new Map<string, CheckpointFlowNode[]>();
    for (const node of nodes) {
      const label = node.data.row.dossier?.trim() || "Chưa xếp bộ";
      const group = groups.get(label) || [];
      group.push(node);
      groups.set(label, group);
    }

    return Array.from(groups, ([label, group]) => {
      const xs = group.map((node) => node.position.x);
      const ys = group.map((node) => node.position.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      return {
        id: `dossier-lane:${label}`,
        type: "dossierLane" as const,
        position: { x: minX - 28, y: minY - 64 },
        data: { label, count: group.length },
        style: {
          width: Math.max(320, maxX - minX + 260 + 56),
          height: Math.max(190, maxY - minY + 140 + 52),
        },
        draggable: false,
        selectable: false,
        connectable: false,
        focusable: false,
        zIndex: 0,
        className: "pointer-events-none",
      };
    });
  }, [nodes]);

  const allNodes = useMemo<CheckpointCanvasNode[]>(
    () => [...laneNodes, ...nodes],
    [laneNodes, nodes],
  );

  const rfEdges = useMemo<Edge[]>(() => {
    const actual: Edge[] = pendingEdges.map((edge) => {
      const id = edgeId(edge);
      const active = id === selectedEdgeId;
      return {
        id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        selected: active,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: active ? "#fbbf24" : "#a16207",
        },
        style: {
          stroke: active ? "#fbbf24" : "#a16207",
          strokeWidth: active ? 2.5 : 1.6,
        },
        data: { inferred: false },
      };
    });

    const inferred: Edge[] = suggestions.map((edge) => {
      const id = suggestionId(edge);
      const active = id === selectedEdgeId;
      return {
        id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        selectable: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: active ? "#67e8f9" : "#155e75",
        },
        style: {
          stroke: active ? "#67e8f9" : "#155e75",
          strokeWidth: active ? 2 : 1.4,
          strokeDasharray: "6 5",
          opacity: 0.85,
        },
        data: { inferred: true },
      };
    });

    return [...actual, ...inferred];
  }, [pendingEdges, suggestions, selectedEdgeId]);

  useEffect(() => {
    if (!selectedEdgeId) return;
    if (!rfEdges.some((edge) => edge.id === selectedEdgeId)) {
      setSelectedEdgeId(null);
    }
  }, [rfEdges, selectedEdgeId]);

  const selectedEdge = useMemo(
    () => rfEdges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [rfEdges, selectedEdgeId],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!isDesktop) return;
      if (!connection.source || !connection.target) return;
      onAddEdge(connection.source, connection.target);
    },
    [isDesktop, onAddEdge],
  );

  const autoLayout = useCallback(() => {
    const layout = layoutCheckpointGraph(rows, pendingEdges);
    for (const row of rows) {
      const position = layout[row.checkpoint_id];
      if (position) onNodePositionChange(row.checkpoint_id, position);
    }
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        position: layout[node.id] ?? node.position,
      })),
    );
    requestAnimationFrame(() => {
      flowRef.current?.fitView({ padding: 0.2, duration: 250 });
    });
  }, [rows, pendingEdges, setNodes, onNodePositionChange]);

  const fitGraph = useCallback(() => {
    flowRef.current?.fitView({ padding: 0.2, duration: 250 });
  }, []);

  const confirmSelectedEdge = useCallback(() => {
    if (!selectedEdge) return;
    const inferred = Boolean(selectedEdge.data?.inferred);
    if (inferred) {
      onAddEdge(selectedEdge.source, selectedEdge.target);
    } else {
      onDeleteEdge(selectedEdge.source, selectedEdge.target);
    }
    setSelectedEdgeId(null);
  }, [selectedEdge, onAddEdge, onDeleteEdge]);

  const nodeLabel = useCallback(
    (checkpointId: string) => {
      const row = rows.find((item) => item.checkpoint_id === checkpointId);
      return row?.node_id?.trim() || checkpointId;
    },
    [rows],
  );

  const issueCount = useMemo(
    () =>
      Array.from(issueMap.values()).filter((issues) => issues.length > 0)
        .length,
    [issueMap],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#09090c]">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-[#0b0b0e]/95 px-3 py-2.5">
        <div className="mr-auto min-w-0">
          <div className="flex items-center gap-2">
            <GitBranch className="size-3.5 text-amber-400" />
            <h2 className="text-xs font-semibold text-zinc-100">
              Sơ đồ phụ thuộc
            </h2>
            {flowDirty && (
              <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                chưa lưu
              </span>
            )}
          </div>
          <p className="truncate text-[10px] text-zinc-500">
            {rows.length} checkpoint · {pendingEdges.length} liên kết ·{" "}
            {suggestions.length} gợi ý
            {issueCount > 0 ? ` · ${issueCount} node cần bổ sung` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fitGraph}
            className="border-white/10 bg-white/[0.03] text-zinc-300"
            title="Fit sơ đồ vào khung nhìn"
          >
            <LayoutGrid className="size-3.5" />
            <span className="hidden lg:inline">Fit</span>
          </Button>

          {isDesktop && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={autoLayout}
                className="border-white/10 bg-white/[0.03] text-zinc-300"
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden lg:inline">Tự sắp xếp</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onApplySuggestions}
                disabled={suggestions.length === 0}
                className="border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
                title="Thêm tất cả cạnh gợi ý từ followup_of / requiredEvidenceIds"
              >
                <Sparkles className="size-3.5" />
                Gợi ý ({suggestions.length})
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={onSaveFlow}
                disabled={!flowDirty || isSaving}
                className="bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                <span className="hidden sm:inline">Lưu sơ đồ</span>
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCreate}
            className="border-white/10 bg-white/[0.03] text-zinc-300"
          >
            + Checkpoint
          </Button>
        </div>

        {selectedEdge && isDesktop && (
          <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[11px]">
            <Link2 className="size-3.5 shrink-0 text-zinc-400" />
            <span className="truncate font-mono text-zinc-300">
              {nodeLabel(selectedEdge.source)}
            </span>
            <ArrowRight className="size-3 shrink-0 text-zinc-600" />
            <span className="truncate font-mono text-zinc-300">
              {nodeLabel(selectedEdge.target)}
            </span>
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wide",
                selectedEdge.data?.inferred
                  ? "bg-cyan-500/10 text-cyan-300"
                  : "bg-amber-500/10 text-amber-300",
              )}
            >
              {selectedEdge.data?.inferred ? "gợi ý" : "đã lưu"}
            </span>
            <Button
              type="button"
              size="sm"
              variant={selectedEdge.data?.inferred ? "default" : "destructive"}
              onClick={confirmSelectedEdge}
              className={cn(
                "ml-auto h-7",
                Boolean(selectedEdge.data?.inferred) &&
                  "bg-cyan-500 text-black hover:bg-cyan-400",
              )}
            >
              {selectedEdge.data?.inferred ? (
                <Sparkles className="size-3.5" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              {selectedEdge.data?.inferred ? "Nhận gợi ý" : "Xóa liên kết"}
            </Button>
          </div>
        )}
      </div>

      {!isDesktop && (
        <p className="shrink-0 border-b border-white/5 bg-white/[0.02] px-3 py-1.5 text-[10px] text-zinc-500">
          Chế độ xem trên di động. Chạm node để mở form; kéo nối và lưu liên kết
          chỉ khả dụng trên desktop.
        </p>
      )}

      <div className="min-h-0 flex-1">
        <ReactFlow<CheckpointCanvasNode, Edge>
          nodes={allNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange as OnNodesChange<CheckpointCanvasNode>}
          onConnect={handleConnect}
          onNodeClick={(_, node) => {
            const row = rows.find((item) => item.checkpoint_id === node.id);
            if (row) onSelect(row);
          }}
          onNodeDragStop={(_, node) =>
            onNodePositionChange(node.id, node.position)
          }
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onPaneClick={() => setSelectedEdgeId(null)}
          onInit={(instance) => {
            flowRef.current = instance;
            window.setTimeout(() => instance.fitView({ padding: 0.2 }), 60);
          }}
          nodesConnectable={isDesktop}
          nodesDraggable={isDesktop}
          edgesFocusable={isDesktop}
          deleteKeyCode={null}
          minZoom={0.2}
          maxZoom={1.6}
          colorMode="dark"
          proOptions={{ hideAttribution: true }}
          className="checkpoint-flow bg-[#09090c]"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
            color="#27272a"
          />
          <Controls showInteractive={false} className="shadow-lg" />
          <MiniMap
            pannable
            zoomable
            className="hidden md:block"
            nodeColor={(node) => {
              const row = rows.find((item) => item.checkpoint_id === node.id);
              if (!row) return "#18181b";
              return row.type === "evidence_picker" ? "#a16207" : "#0369a1";
            }}
            maskColor="rgba(9, 9, 12, 0.72)"
          />
        </ReactFlow>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-white/10 bg-[#0b0b0e] px-3 py-1.5 text-[10px] text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-px w-5 bg-amber-600" /> phụ thuộc đã lưu
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-px w-5 border-t border-dashed border-cyan-700" />{" "}
          gợi ý từ CMS
        </span>
        <span className="ml-auto hidden sm:inline">
          Kéo node để sắp xếp · kéo cổng phải để nối · bấm Lưu sơ đồ để giữ vị
          trí
        </span>
      </div>
    </div>
  );
}
