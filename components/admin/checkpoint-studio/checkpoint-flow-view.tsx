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
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { DbCaseCheckpoint, DbCaseDossier } from "@/lib/types/database";
import { useDossierDocuments } from "@/lib/hooks/use-dossier-documents";
import type { DbDossierDocument } from "@/lib/actions/dossier-actions";
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

interface CaseOption {
  value: string;
  label: string;
}

interface CheckpointFlowViewProps {
  caseId?: string;
  cases?: CaseOption[];
  onCaseChange?: (caseId: string) => void;
  rows: DbCaseCheckpoint[];
  dossiers?: DbCaseDossier[];
  selectedId: string | null;
  pendingEdges: CheckpointGraphEdge[];
  suggestions: CheckpointGraphEdge[];
  flowDirty: boolean;
  hasUnsaved?: boolean;
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
  onSaveAll?: () => void;
  onDossierClick?: (dossierOrName: DbCaseDossier | string) => void;
  onCreateDossier?: () => void;
  onCreateCase?: () => void;
}

interface CheckpointNodeData extends Record<string, unknown> {
  row: DbCaseCheckpoint;
  issueLabels: string[];
  hintCount: number;
  evidenceCount: number;
  isSelected: boolean;
  unlockedDossier?: {
    name: string;
    count: number;
    dossierObj?: DbCaseDossier;
  };
  onDossierClick?: (dossierOrName: DbCaseDossier | string) => void;
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
  const {
    row,
    issueLabels,
    hintCount: hints,
    evidenceCount: evidences,
    unlockedDossier,
    onDossierClick,
  } = data;
  const active = selected || data.isSelected;
  const isEpilogue = row.type === "epilogue" || row.checkpoint_id.includes("epilogue");

  const epilogueStoriesCount = Array.isArray(
    (row.answer_config as any)?.epilogueStories,
  )
    ? (row.answer_config as any).epilogueStories.length
    : 4;

  return (
    <div
      className={cn(
        "rounded-xl border shadow-xl transition-all",
        isEpilogue
          ? cn(
              "w-[190px] px-3 py-2.5",
              active
                ? "border-emerald-400 bg-[#0d1813] ring-2 ring-emerald-400/25 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                : "border-emerald-500/40 bg-[#0a130f] hover:border-emerald-400 hover:bg-[#0d1813]",
            )
          : cn(
              "w-[260px] p-3",
              active
                ? "border-amber-400/70 bg-[#141418] ring-2 ring-amber-400/20"
                : "border-white/10 bg-[#101014] hover:border-white/25",
            ),
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          background: isEpilogue ? "#10b981" : "#a1a1aa",
          border: "2px solid #101014",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          background: isEpilogue ? "#10b981" : "#fbbf24",
          border: "2px solid #101014",
        }}
      />

      {isEpilogue ? (
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-xs text-emerald-300 uppercase tracking-wide">
            Hậu Án
          </span>
          <span className="font-mono text-[11px] font-medium text-emerald-400/80">
            {epilogueStoriesCount} phần
          </span>
          {issueLabels.length > 0 && (
            <span
              title={issueLabels.join(" · ")}
              className="flex size-4 items-center justify-center rounded-full bg-red-500/15 text-[9px] font-bold text-red-300"
            >
              {issueLabels.length}
            </span>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5">
            <span className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide flex items-center gap-1 font-semibold bg-amber-500/10 text-amber-300">
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

          {unlockedDossier && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (unlockedDossier.dossierObj) {
                  onDossierClick?.(unlockedDossier.dossierObj);
                } else {
                  onDossierClick?.(unlockedDossier.name);
                }
              }}
              className="mt-2.5 flex items-center justify-between rounded-lg border border-purple-500/35 bg-purple-950/30 px-2 py-1.5 text-purple-200 transition-colors hover:border-purple-400 hover:bg-purple-900/40 cursor-pointer group"
              title="Bấm để quản lý tài liệu trong bộ hồ sơ này"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <FolderOpen className="size-3.5 shrink-0 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="truncate font-mono text-[10px] font-bold tracking-tight uppercase text-purple-100">
                  Mở: {unlockedDossier.name}
                </span>
              </div>
              <span className="shrink-0 rounded bg-purple-500/20 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-purple-300">
                {unlockedDossier.count} tài liệu
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DossierNodeCard({ data, selected }: NodeProps<DossierNode>) {
  const dossierName = String(data?.dossierName || "Hồ Sơ");
  const count = Number(data?.documentCount ?? 0);

  return (
    <div
      className={cn(
        "group relative flex h-[120px] w-[120px] flex-col items-center justify-center rounded-xl border p-2 text-center transition-all select-none cursor-pointer",
        selected
          ? "border-purple-400 bg-[#161220] ring-2 ring-purple-400/25 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          : "border-purple-500/30 bg-[#100f18] hover:border-purple-400 hover:bg-[#151222] shadow-lg",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          width: 8,
          height: 8,
          background: "#a855f7",
          border: "2px solid #100f18",
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          width: 8,
          height: 8,
          background: "#a855f7",
          border: "2px solid #100f18",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 8,
          height: 8,
          background: "#a855f7",
          border: "2px solid #100f18",
        }}
      />

      <FolderOpen className="size-5 text-purple-400 mb-1 transition-transform group-hover:scale-110" />
      <h3 className="line-clamp-2 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-100">
        {dossierName}
      </h3>
      <p className="mt-1 font-mono text-[10px] font-semibold text-purple-300">
        {count} tài liệu
      </p>
      <span className="mt-1 text-[8px] font-sans text-zinc-500 group-hover:text-purple-300 transition-colors">
        Bấm để quản lý
      </span>
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
  cases = [],
  onCaseChange,
  rows,
  dossiers = [],
  selectedId,
  pendingEdges,
  suggestions,
  flowDirty,
  hasUnsaved,
  isSaving,
  focusRequest,
  onSelect,
  onCreate,
  onAddEdge,
  onDeleteEdge,
  onApplySuggestions,
  onNodePositionChange,
  onSaveFlow,
  onSaveAll,
  onDossierClick,
  onCreateDossier,
  onCreateCase,
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
    const dossiersMap = new Map<
      string,
      {
        dossierObj?: DbCaseDossier;
        group: DbCaseCheckpoint[];
        unlockedBy?: DbCaseCheckpoint;
      }
    >();

    // 1. Thêm tất cả bộ hồ sơ cấu hình sẵn từ case_dossiers
    for (const d of dossiers) {
      const label = d.title?.trim() || d.dossier_key;
      dossiersMap.set(label, { dossierObj: d, group: [] });
    }

    // 2. Gom các checkpoint vào bộ tương ứng
    for (const row of rows) {
      const dName = row.dossier?.trim() || "Chưa xếp bộ";
      let matchKey = dName;
      for (const [key, val] of dossiersMap.entries()) {
        if (
          key.toLowerCase() === dName.toLowerCase() ||
          val.dossierObj?.dossier_key.toLowerCase() === dName.toLowerCase()
        ) {
          matchKey = key;
          break;
        }
      }
      const existing = dossiersMap.get(matchKey) || { group: [] };
      existing.group.push(row);
      dossiersMap.set(matchKey, existing);
    }

    // 3. Liên kết unlock
    for (const row of rows) {
      const unlocked = (row.answer_config as any)?.unlocksDossier?.trim();
      if (unlocked) {
        for (const [key, val] of dossiersMap.entries()) {
          if (
            key.toLowerCase() === unlocked.toLowerCase() ||
            val.dossierObj?.dossier_key.toLowerCase() === unlocked.toLowerCase()
          ) {
            val.unlockedBy = row;
            break;
          }
        }
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

        // Kiểm tra xem checkpoint này có mở khóa Bộ hồ sơ nào không
        const unlocked = (row.answer_config as any)?.unlocksDossier?.trim();
        let unlockedDossier:
          | {
              name: string;
              count: number;
              dossierObj?: DbCaseDossier;
            }
          | undefined = undefined;

        if (unlocked) {
          const matchedInfo = Array.from(dossiersMap.entries()).find(
            ([k, v]) =>
              k.toLowerCase() === unlocked.toLowerCase() ||
              v.dossierObj?.dossier_key.toLowerCase() === unlocked.toLowerCase(),
          );
          const dName = matchedInfo ? matchedInfo[0] : unlocked;
          const dObj = matchedInfo ? matchedInfo[1].dossierObj : undefined;
          const docCount = dObj?.document_codes
            ? dObj.document_codes.length
            : countDocumentsForDossier(dName, dossierDocs);

          unlockedDossier = {
            name: dName,
            count: docCount,
            dossierObj: dObj,
          };
        }

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
            unlockedDossier,
            onDossierClick,
          },
          selected: row.id === selectedId,
          zIndex: 1,
        };
      });

      // 2. Dossier square box nodes - CHỈ TẠO CHO CÁC BỘ ĐỘC LẬP (ví dụ bộ khởi đầu chưa ai mở khóa)
      const cpPositions = new Map<string, { x: number; y: number }>();
      for (const cp of cpNodes) {
        cpPositions.set(cp.id, cp.position);
      }

      // Vị trí mặc định tham chiếu nếu là bộ "Ban Đầu" (chưa ai mở khóa)
      const firstCp = cpNodes[0]?.position ?? { x: 0, y: 0 };

      const unattachedDossiers = Array.from(dossiersMap).filter(
        ([, info]) => !info.unlockedBy,
      );

      const dNodes: DossierNode[] = unattachedDossiers.map(([label, info]) => {
        const existing = previous.get(`dossier-node:${label}`);
        const savedPos = dossierPositions[`dossier-node:${label}`];

        // Lấy số tài liệu trực tiếp từ cấu hình case_dossiers nếu có
        const docCount = info.dossierObj?.document_codes
          ? info.dossierObj.document_codes.length
          : countDocumentsForDossier(label, dossierDocs);

        let finalPos = existing?.position ?? savedPos ?? { x: firstCp.x - 160, y: firstCp.y + 10 };

        if (!existing?.position && !savedPos) {
          const xs = info.group.map(
            (r) =>
              cpPositions.get(r.checkpoint_id)?.x ??
              r.flow_position?.x ??
              layout[r.checkpoint_id]?.x ??
              0,
          );
          const ys = info.group.map(
            (r) =>
              cpPositions.get(r.checkpoint_id)?.y ??
              r.flow_position?.y ??
              layout[r.checkpoint_id]?.y ??
              0,
          );
          if (xs.length > 0) {
            const minX = Math.min(...xs);
            const avgY = Math.round(ys.reduce((a, b) => a + b, 0) / ys.length);
            finalPos = { x: minX - 160, y: avgY };
          }
        }

        return {
          id: `dossier-node:${label}`,
          type: "dossierNode" as const,
          position: finalPos,
          data: {
            dossierName: label,
            documentCount: docCount,
          },
          draggable: isDesktop, // Cho phép kéo di chuyển tự do
          selectable: true,
          connectable: false,
          zIndex: 5,
        };
      });

      return [...dNodes, ...cpNodes];
    });
  }, [
    rows,
    dossiers,
    pendingEdges,
    selectedId,
    issueMap,
    dossierPositions,
    dossierDocs,
    isDesktop,
    setNodes,
    onDossierClick,
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

    // Bản đồ chuẩn hóa label Dossier Node
    const dossierLabels = new Map<string, string>();
    for (const d of dossiers) {
      const label = d.title?.trim() || d.dossier_key;
      dossierLabels.set(label.toLowerCase(), label);
      dossierLabels.set(d.dossier_key.toLowerCase(), label);
    }
    for (const r of rows) {
      if (r.dossier?.trim()) {
        const d = r.dossier.trim();
        if (!dossierLabels.has(d.toLowerCase())) {
          dossierLabels.set(d.toLowerCase(), d);
        }
      }
    }

    const resolveLabel = (name: string): string => {
      return dossierLabels.get(name.toLowerCase().trim()) || name.trim();
    };

    // 1. Cạnh mở khóa: bộ hồ sơ hiện đã được gắn trực tiếp thành badge/footer trong chính Checkpoint
    // nên không cần vẽ thêm cạnh riêng cho bộ được mở khóa nữa.
    return list;
  }, [rows, dossiers]);

  const rfEdges = useMemo<Edge[]>(() => {
    const actual: Edge[] = pendingEdges.map((edge) => {
      const id = edgeId(edge);
      const active = id === selectedEdgeId;
      const isEpilogueEdge =
        edge.target === "cp-000-epilogue" || edge.target.includes("epilogue");
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
          color: active
            ? isEpilogueEdge
              ? "#34d399"
              : "#fbbf24"
            : isEpilogueEdge
              ? "#059669"
              : "#a16207",
        },
        style: {
          stroke: active
            ? isEpilogueEdge
              ? "#34d399"
              : "#fbbf24"
            : isEpilogueEdge
              ? "#059669"
              : "#a16207",
          strokeWidth: active ? 2.5 : 1.6,
        },
        data: { inferred: false },
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
        {/* Bộ lọc Vụ án đặt ở đầu header */}
        {cases.length > 0 && onCaseChange && (
          <div className="flex items-center gap-1.5 mr-2 shrink-0">
            <select
              value={caseId}
              onChange={(e) => onCaseChange(e.target.value)}
              className="h-8 rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs font-semibold text-zinc-100 outline-none focus:border-amber-500/50 shadow-inner"
            >
              {cases.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                  className="bg-[#141618] text-zinc-100 font-sans"
                >
                  {item.label}
                </option>
              ))}
            </select>

            {onCreateCase && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCreateCase}
                className="h-8 border-white/10 bg-white/[0.04] text-xs text-zinc-300 hover:text-amber-300 hover:border-amber-500/40 px-2"
                title="Tạo vụ án mới"
              >
                <Plus className="size-3.5" />
                <span>Case</span>
              </Button>
            )}
          </div>
        )}

        <div className="mr-auto min-w-0">
          <div className="flex items-center gap-2">
            <GitBranch className="size-3.5 text-amber-400" />
            <h2 className="text-xs font-semibold text-zinc-100">
              Sơ đồ phụ thuộc
            </h2>
            {(flowDirty || hasUnsaved) && (
              <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                chưa lưu
              </span>
            )}
          </div>
          <p className="truncate text-[10px] text-zinc-500">
            {rows.length} checkpoint
            {issueCount > 0 ? ` · ${issueCount} node cần bổ sung` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {isDesktop && (
            <Button
              type="button"
              size="sm"
              onClick={onSaveAll || onSaveFlow}
              disabled={(!flowDirty && !hasUnsaved) || isSaving}
              className="bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              <span className="hidden sm:inline">Lưu</span>
            </Button>
          )}

          {onCreateDossier && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCreateDossier}
              className="border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs"
              title="Tạo hoặc cấu hình một bộ hồ sơ mới"
            >
              <FolderOpen className="size-3.5 text-purple-400" />
              <span>+ Bộ hồ sơ</span>
            </Button>
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
            if (node.id.startsWith("dossier-node:")) {
              const label = node.id.replace("dossier-node:", "");
              const match = dossiers.find(
                (d) =>
                  d.title.toLowerCase() === label.toLowerCase() ||
                  d.dossier_key.toLowerCase() === label.toLowerCase(),
              );
              if (match) {
                onDossierClick?.(match);
              } else {
                onDossierClick?.(label);
              }
              return;
            }
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
              if (node.id.startsWith("dossier-node:")) return "#a855f7";
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
