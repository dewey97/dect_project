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
  FolderOpen,
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

interface NodeFocusRequest {
  checkpointId: string;
  nonce: number;
}

interface CheckpointFlowViewProps {
  caseId?: string;
  rows: DbCaseCheckpoint[];
  selectedId: string | null;
  pendingEdges: CheckpointGraphEdge[];
  suggestions: CheckpointGraphEdge[];
  flowDirty: boolean;
  isSaving: boolean;
  focusRequest: NodeFocusRequest | null;
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

interface DossierNodeData extends Record<string, unknown> {
  dossierName: string;
  documentCount: number;
}

type DossierNode = Node<DossierNodeData, "dossierNode">;
type CheckpointCanvasNode = CheckpointFlowNode | DossierNode;

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
        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-amber-300">
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

      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-zinc-100">
        {row.title || "(Chưa có tiêu đề)"}
      </p>

      <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
        <span>{hints} gợi ý</span>
        {row.type === "evidence_picker" && (
          <>
            <span className="text-zinc-700">·</span>
            <span>{evidences} mã chứng cứ</span>
          </>
        )}
      </div>
    </div>
  );
}

function DossierNodeCard({ data, selected }: NodeProps<DossierNode>) {
  const dossierName = String(data?.dossierName || "Hồ Sơ");
  const count = Number(data?.documentCount ?? 0);

  return (
    <div
      className={cn(
        "relative flex h-[120px] w-[120px] flex-col items-center justify-center rounded-xl border bg-[#101014] p-3 text-center transition-colors select-none",
        selected
          ? "border-amber-400 ring-2 ring-amber-400/20"
          : "border-white/10 hover:border-white/25",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 8,
          height: 8,
          background: "#a1a1aa",
          border: "2px solid #101014",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 8,
          height: 8,
          background: "#fbbf24",
          border: "2px solid #101014",
        }}
      />

      <FolderOpen className="size-5 text-amber-400/90 mb-2" />
      <h3 className="line-clamp-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-100">
        {dossierName}
      </h3>
      <p className="mt-1 font-mono text-[10px] text-zinc-400">
        {count} tài liệu
      </p>
    </div>
  );
}

function countDocumentsForDossier(dossierName: string, allDocs: DbDossierDocument[] = []): number {
  const norm = dossierName.toLowerCase().trim();

  if (norm.includes("a") || norm === "bộ a") {
    const docs = allDocs.filter((d) => (d.tag_code || "").toUpperCase().startsWith("A-"));
    return docs.length || 9;
  }
  if (norm.includes("b") || norm === "bộ b") {
    const docs = allDocs.filter((d) => {
      const code = (d.tag_code || "").toUpperCase();
      return code.startsWith("B-") || code.startsWith("E-");
    });
    return docs.length || 8;
  }
  if (norm.includes("c") || norm === "bộ c") {
    const docs = allDocs.filter((d) => {
      const code = (d.tag_code || "").toUpperCase();
      return code.startsWith("C-") || code.startsWith("D-");
    });
    return docs.length || 6;
  }
  if (norm.includes("ban đầu") || norm.includes("khởi đầu") || norm.includes("mở đầu")) {
    return 4;
  }
  if (norm.includes("kết luận") || norm.includes("hậu án")) {
    return 4;
  }

  const matched = allDocs.filter((d) => {
    const tag = (d.tag_code || "").toLowerCase();
    const title = (d.subject_name || "").toLowerCase();
    return tag.includes(norm) || title.includes(norm);
  });
  return matched.length;
}

const nodeTypes: NodeTypes = {
  checkpoint: CheckpointFlowNodeCard,
  dossierNode: DossierNodeCard,
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
  caseId = "case_000",
  rows,
  selectedId,
  pendingEdges,
  suggestions,
  flowDirty,
  isSaving,
  focusRequest,
  onSelect,
  onCreate,
  onAddEdge,
  onDeleteEdge,
  onApplySuggestions,
  onNodePositionChange,
  onSaveFlow,
}: CheckpointFlowViewProps) {
  const isDesktop = useIsDesktop();
  const { documents: dossierDocs } = useDossierDocuments(caseId);
  const flowRef = useRef<ReactFlowInstance<CheckpointCanvasNode, Edge> | null>(
    null,
  );
  const lastFocusNonce = useRef(0);
  const [isFlowReady, setIsFlowReady] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<CheckpointCanvasNode>([]);

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

  const [dossierPositions, setDossierPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("checkpoint_studio_dossier_positions");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const handleDossierPositionChange = useCallback(
    (id: string, pos: { x: number; y: number }) => {
      setDossierPositions((prev) => {
        const next = {
          ...prev,
          [id]: { x: Math.round(pos.x), y: Math.round(pos.y) },
        };
        try {
          localStorage.setItem(
            "checkpoint_studio_dossier_positions",
            JSON.stringify(next),
          );
        } catch {}
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    const layout = layoutCheckpointGraph(rows, pendingEdges);

    // Gom checkpoint theo bộ hồ sơ
    const dossiers = new Map<
      string,
      { group: DbCaseCheckpoint[]; unlockedBy?: DbCaseCheckpoint }
    >();

    for (const row of rows) {
      const dName = row.dossier?.trim() || "Chưa xếp bộ";
      const existing = dossiers.get(dName) || { group: [] };
      existing.group.push(row);
      dossiers.set(dName, existing);
    }

    for (const row of rows) {
      const unlocked = (row.answer_config as any)?.unlocksDossier?.trim();
      if (unlocked && dossiers.has(unlocked)) {
        dossiers.get(unlocked)!.unlockedBy = row;
      }
    }

    setNodes((current) => {
      const previous = new Map(current.map((node) => [node.id, node]));

      // 1. Checkpoint nodes
      const cpNodes: CheckpointFlowNode[] = rows.map((row) => {
        const existing = previous.get(row.checkpoint_id);
        const saved = row.flow_position;
        const savedPosition =
          saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)
            ? saved
            : null;
        return {
          id: row.checkpoint_id,
          type: "checkpoint" as const,
          position:
            existing?.position ??
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

      // 2. Dossier square box nodes
      const dNodes: DossierNode[] = Array.from(dossiers, ([label, info]) => {
        const existing = previous.get(`dossier-node:${label}`);
        const savedPos = dossierPositions[`dossier-node:${label}`];

        const xs = info.group.map(
          (r) => r.flow_position?.x ?? layout[r.checkpoint_id]?.x ?? 0,
        );
        const ys = info.group.map(
          (r) => r.flow_position?.y ?? layout[r.checkpoint_id]?.y ?? 0,
        );
        const minX = xs.length ? Math.min(...xs) : 0;
        const avgY = ys.length
          ? Math.round(ys.reduce((a, b) => a + b, 0) / ys.length)
          : 0;

        const defaultPos = { x: minX - 240, y: avgY };

        return {
          id: `dossier-node:${label}`,
          type: "dossierNode" as const,
          position: existing?.position ?? savedPos ?? defaultPos,
          data: {
            dossierName: label,
            documentCount: countDocumentsForDossier(label, dossierDocs),
          },
          draggable: isDesktop,
          selectable: true,
          connectable: false,
          zIndex: 5,
        };
      });

      return [...dNodes, ...cpNodes];
    });
  }, [
    rows,
    pendingEdges,
    selectedId,
    issueMap,
    dossierPositions,
    dossierDocs,
    isDesktop,
    setNodes,
  ]);

  useEffect(() => {
    if (!isFlowReady) return;
    if (!focusRequest || lastFocusNonce.current === focusRequest.nonce) return;
    const instance = flowRef.current;
    if (!instance) return;
    const node = instance.getNode(focusRequest.checkpointId);
    if (!node) return;

    lastFocusNonce.current = focusRequest.nonce;
    const width = node.measured?.width ?? 260;
    const height = node.measured?.height ?? 140;
    instance.setCenter(
      node.position.x + width / 2,
      node.position.y + height / 2,
      {
        zoom: Math.max(instance.getZoom(), 0.9),
        duration: 300,
      },
    );
  }, [focusRequest, nodes, isFlowReady]);

  const dossierEdges = useMemo<Edge[]>(() => {
    const list: Edge[] = [];

    // 1. Cạnh mở khóa: từ Checkpoint giải xong -> Bộ Hồ Sơ được mở
    for (const row of rows) {
      const unlocked = (row.answer_config as any)?.unlocksDossier?.trim();
      if (unlocked) {
        list.push({
          id: `unlock-dossier:${row.checkpoint_id}->${unlocked}`,
          source: row.checkpoint_id,
          target: `dossier-node:${unlocked}`,
          type: "smoothstep",
          animated: false,
          label: `Mở ${unlocked}`,
          labelStyle: { fill: "#f59e0b", fontSize: 9, fontWeight: 600 },
          labelBgStyle: { fill: "#141416", rx: 3, ry: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: "#d97706",
          },
          style: { stroke: "#d97706", strokeWidth: 1.6 },
        });
      }
    }

    // 2. Cạnh thuộc bộ: từ Bộ Hồ Sơ -> các Checkpoint khởi đầu bên trong bộ
    const byDossier = new Map<string, DbCaseCheckpoint[]>();
    for (const row of rows) {
      const dName = row.dossier?.trim();
      if (dName) {
        const group = byDossier.get(dName) || [];
        group.push(row);
        byDossier.set(dName, group);
      }
    }

    for (const [dName, group] of byDossier.entries()) {
      const groupIds = new Set(group.map((r) => r.checkpoint_id));
      for (const row of group) {
        const hasParentInSameDossier = (row.depends_on || []).some((dep) =>
          groupIds.has(dep),
        );
        if (!hasParentInSameDossier) {
          list.push({
            id: `dossier-entry:${dName}->${row.checkpoint_id}`,
            source: `dossier-node:${dName}`,
            target: row.checkpoint_id,
            type: "smoothstep",
            selectable: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 12,
              height: 12,
              color: "#38bdf8",
            },
            style: {
              stroke: "#0284c7",
              strokeWidth: 1.5,
              strokeDasharray: "4 3",
              opacity: 0.7,
            },
          });
        }
      }
    }

    return list;
  }, [rows]);

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

    return [...actual, ...dossierEdges];
  }, [pendingEdges, selectedEdgeId, dossierEdges]);

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
      return row?.title?.trim() || row?.question?.trim() || "Checkpoint";
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
            {rows.length} checkpoint · {pendingEdges.length} liên kết
            {issueCount > 0 ? ` · ${issueCount} node cần bổ sung` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          

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
            <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-amber-300">
              liên kết
            </span>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={confirmSelectedEdge}
              className="ml-auto h-7"
            >
              <Trash2 className="size-3.5" />
              Xóa liên kết
            </Button>
          </div>
        )}
      </div>

      {!isDesktop && (
        <p className="shrink-0 border-b border-white/5 bg-white/[0.02] px-3 py-1.5 text-[10px] text-zinc-500">
          Chế độ xem trên di động. Chạm node để mở hộp biên tập; kéo nối và lưu
          liên kết chỉ khả dụng trên desktop.
        </p>
      )}

      <div className="min-h-0 flex-1">
        <ReactFlow<CheckpointCanvasNode, Edge>
          nodes={nodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onConnect={handleConnect}
          onNodeClick={(_, node) => {
            const row = rows.find((item) => item.checkpoint_id === node.id);
            if (row) onSelect(row);
          }}
          onNodeDragStop={(_, node) => {
            if (node.id.startsWith("dossier-node:")) {
              handleDossierPositionChange(node.id, node.position);
            } else {
              onNodePositionChange(node.id, node.position);
            }
          }}
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onPaneClick={() => setSelectedEdgeId(null)}
          onInit={(instance) => {
            flowRef.current = instance;
            setIsFlowReady(true);
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
              if (node.id.startsWith("dossier-node:")) return "#f59e0b";
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
        
        <span className="ml-auto hidden sm:inline">
          Kéo node để sắp xếp · kéo cổng phải để nối · bấm Lưu sơ đồ để giữ vị
          trí
        </span>
      </div>
    </div>
  );
}
