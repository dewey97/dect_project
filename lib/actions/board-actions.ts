"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/lib/auth/admin";
import { normalizeCaseId } from "@/lib/cases/case-id";
import type {
  PinPoint,
  CaseConnection,
} from "@/components/investigation/hero-interactive";
import type {
  DbCaseBoardNode,
  BoardConfig,
  BoardNodeKind,
} from "@/lib/types/database";

const STUDIO_PATH = "/studio/checkpoints";

export interface BoardNodeDraft {
  id?: string;
  caseId: string;
  nodeKind: BoardNodeKind;
  title?: string | null;
  subjectKey?: string | null;
  checkpointId?: string | null;
  slotIndex?: number;
  config?: BoardConfig;
}

export type BoardActionResult<T> =
  { success: true; data: T } | { success: false; error: string };

// ==============================================================================
// WT-1: Case Board Nodes (Dynamic Board System)
// ==============================================================================

/**
 * Đọc danh sách board nodes của một vụ án (cho Studio / server components).
 */
export async function getBoardNodes(
  caseId: string,
): Promise<BoardActionResult<DbCaseBoardNode[]>> {
  try {
    const caseSlug = normalizeCaseId(caseId);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_board_nodes")
      .select("*")
      .eq("case_slug", caseSlug)
      .order("slot_index", { ascending: true });

    if (error) {
      if (error.code === "42P01") {
        return { success: true, data: [] };
      }
      throw error;
    }

    return { success: true, data: (data || []) as DbCaseBoardNode[] };
  } catch (error: unknown) {
    console.error("Error loading board nodes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Tạo mới hoặc cập nhật một board node (admin only).
 */
export async function saveBoardNode(
  draft: BoardNodeDraft,
): Promise<BoardActionResult<DbCaseBoardNode>> {
  try {
    await requireAdminAuth();
    const caseSlug = normalizeCaseId(draft.caseId);
    const id =
      draft.id ||
      `${caseSlug}:${draft.nodeKind}:${draft.subjectKey || draft.checkpointId || crypto.randomUUID()}`;

    const supabase = await createClient();
    const payload = {
      id,
      case_slug: caseSlug,
      node_kind: draft.nodeKind,
      title: draft.title ?? null,
      subject_key: draft.subjectKey ?? null,
      checkpoint_id: draft.checkpointId ?? null,
      slot_index: draft.slotIndex ?? 0,
      config: draft.config ?? {},
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("case_board_nodes")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;

    revalidatePath(STUDIO_PATH);
    revalidatePath(`/evidence/web`);
    return { success: true, data: data as DbCaseBoardNode };
  } catch (error: unknown) {
    console.error("Error saving board node:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Xóa một board node (admin only).
 */
export async function deleteBoardNode(
  id: string,
): Promise<BoardActionResult<{ id: string }>> {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("case_board_nodes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath(STUDIO_PATH);
    revalidatePath(`/evidence/web`);
    return { success: true, data: { id } };
  } catch (error: unknown) {
    console.error("Error deleting board node:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Lưu hàng loạt board nodes (vị trí kéo thả, cấu hình; admin only).
 */
export async function saveBoardNodesBatch(
  nodes: Array<Partial<DbCaseBoardNode> & { id: string; case_slug: string }>,
): Promise<BoardActionResult<number>> {
  try {
    await requireAdminAuth();
    if (!nodes.length) return { success: true, data: 0 };

    const supabase = await createClient();
    const now = new Date().toISOString();
    const rows = nodes.map((node) => ({
      ...node,
      updated_at: now,
    }));

    const { error } = await supabase.from("case_board_nodes").upsert(rows);

    if (error) throw error;

    revalidatePath(STUDIO_PATH);
    revalidatePath(`/evidence/web`);
    return { success: true, data: rows.length };
  } catch (error: unknown) {
    console.error("Error saving board nodes batch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Cập nhật cấu hình board_config cho một checkpoint (admin only).
 */
export async function updateCheckpointBoardConfig(
  checkpointId: string,
  boardConfig: BoardConfig,
): Promise<BoardActionResult<{ id: string }>> {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error } = await supabase
      .from("case_checkpoints")
      .update({
        board_config: boardConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("id", checkpointId);

    if (error) throw error;

    revalidatePath(STUDIO_PATH);
    revalidatePath(`/evidence/web`);
    return { success: true, data: { id: checkpointId } };
  } catch (error: unknown) {
    console.error("Error updating checkpoint board config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ==============================================================================
// Boardgame Pins & Connections (Legacy + Pin drag storage)
// ==============================================================================

// Save positions of default (system) pins + admin custom pins + connections
export async function saveBoardgamePinPositions(
  caseId: string,
  pins: PinPoint[],
  connections: CaseConnection[] = [],
) {
  try {
    await requireAdminAuth();

    const supabase = await createClient();

    const normalizedId = normalizeCaseId(caseId);

    // 1. Map PinPoint sang format DB
    const formattedPins = pins.map((p) => ({
      id: p.id,
      case_id: normalizedId,
      position_x: p.x,
      position_y: p.y,
      label: p.label,
      detail: p.detail,
      color: p.color || null,
      note_color: p.noteColor || null,
      pin_color: p.pinColor || null,
      photo_url: p.photoUrl || null,
      is_locked: p.isLocked || false,
      is_solved: p.isSolved || false,
      pulse_border: p.pulseBorder || false,
      rotation: typeof p.rotation === "number" ? p.rotation : 0,
      scale: typeof p.scale === "number" && p.scale > 0 ? p.scale : 1.0,
      updated_at: new Date().toISOString(),
    }));

    const formattedConns = (connections || []).map((c) => ({
      id: c.id,
      case_id: normalizedId,
      from_pin_id: c.fromPinId,
      to_pin_id: c.toPinId,
      updated_at: new Date().toISOString(),
    }));

    const pinIds = formattedPins.map((p) => p.id);

    // 2. Xóa các pins không còn tồn tại (id TEXT nên phải quote từng giá trị
    //    trong filter `in`, nếu không PostgREST parse sai id có dấu gạch ngang)
    const quotedPinIds = pinIds.map((id) => `"${id}"`).join(",");
    if (pinIds.length > 0) {
      await supabase
        .from("boardgame_pins")
        .delete()
        .eq("case_id", normalizedId)
        .not("id", "in", `(${quotedPinIds})`);
    } else {
      await supabase
        .from("boardgame_pins")
        .delete()
        .eq("case_id", normalizedId);
    }

    // 3. Upsert Pins (bao rotation/scale, id TEXT cho phép c0-pin-...)
    if (formattedPins.length > 0) {
      const { error: pinError } = await supabase
        .from("boardgame_pins")
        .upsert(formattedPins, { onConflict: "id" });
      if (pinError) throw pinError;
    }

    // 4. Đồng bộ connections dây đỏ admin (quote id TEXT như trên)
    const connIds = formattedConns.map((c) => c.id);
    const quotedConnIds = connIds.map((id) => `"${id}"`).join(",");
    if (connIds.length > 0) {
      const { error: delConnError } = await supabase
        .from("boardgame_connections")
        .delete()
        .eq("case_id", normalizedId)
        .not("id", "in", `(${quotedConnIds})`);
      if (delConnError) throw delConnError;
      const { error: connError } = await supabase
        .from("boardgame_connections")
        .upsert(formattedConns, { onConflict: "id" });
      if (connError) throw connError;
    } else {
      const { error: delAllError } = await supabase
        .from("boardgame_connections")
        .delete()
        .eq("case_id", normalizedId);
      if (delAllError) throw delAllError;
    }

    revalidatePath(`/cases/${caseId}/evidence/boardgame`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error saving boardgame pin positions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Get layout chuẩn: pins (bao rotation/scale) + connections dây đỏ admin
export async function getBoardgamePinPositions(caseId: string): Promise<{
  success: boolean;
  pins: PinPoint[];
  connections: CaseConnection[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const normalizedId = normalizeCaseId(caseId);

    const { data: pinsData, error: pinError } = await supabase
      .from("boardgame_pins")
      .select("*")
      .eq("case_id", normalizedId);

    if (pinError) throw pinError;

    const { data: connsData, error: connError } = await supabase
      .from("boardgame_connections")
      .select("*")
      .eq("case_id", normalizedId);

    if (connError) throw connError;

    const pins: PinPoint[] = (pinsData || []).map((p) => ({
      id: p.id,
      x: p.position_x,
      y: p.position_y,
      label: p.label,
      detail: p.detail,
      color: p.color || undefined,
      noteColor: p.note_color || undefined,
      pinColor: p.pin_color || undefined,
      photoUrl: p.photo_url || undefined,
      isLocked: p.is_locked || undefined,
      isSolved: p.is_solved || undefined,
      pulseBorder: p.pulse_border || undefined,
      rotation: typeof p.rotation === "number" ? p.rotation : undefined,
      scale: typeof p.scale === "number" && p.scale > 0 ? p.scale : undefined,
    }));

    const connections: CaseConnection[] = (connsData || []).map((c) => ({
      id: c.id,
      fromPinId: c.from_pin_id,
      toPinId: c.to_pin_id,
    }));

    return { success: true, pins, connections };
  } catch (error: unknown) {
    console.error("Error fetching boardgame pin positions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      pins: [],
      connections: [],
    };
  }
}

// ==============================================================================
// Evidence Board (Studio React Flow)
// ==============================================================================

export interface EvidenceNodeInput {
  id?: string;
  type?: string;
  position: { x: number; y: number };
  data?: {
    label?: string;
    description?: string;
    category?: string;
    [key: string]: unknown;
  };
}

export interface EvidenceEdgeInput {
  id?: string;
  source: string;
  target: string;
}

export async function saveEvidenceBoard(
  caseId: string,
  nodes: EvidenceNodeInput[],
  edges: EvidenceEdgeInput[],
) {
  try {
    await requireAdminAuth(); // Chỉ admin mới được sửa

    const supabase = await createClient();

    const isUuid = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        str,
      );

    // 1. Format Nodes với UUID hợp lệ
    const formattedNodes = nodes.map((n) => {
      const nodeId = n.id && isUuid(n.id) ? n.id : crypto.randomUUID();
      return {
        id: nodeId,
        case_id: caseId,
        type: n.type || "default",
        position_x: n.position.x,
        position_y: n.position.y,
        label: n.data?.label || "",
        description: n.data?.description || "",
        category: n.data?.category || "",
        logic_data: n.data || {},
      };
    });

    const nodeIds = formattedNodes.map((n) => n.id);

    // 2. Xóa các nodes không còn tồn tại
    if (nodeIds.length > 0) {
      await supabase
        .from("evidence_nodes")
        .delete()
        .eq("case_id", caseId)
        .not("id", "in", `(${nodeIds.join(",")})`);
    } else {
      await supabase.from("evidence_nodes").delete().eq("case_id", caseId);
    }

    // 3. Upsert Nodes
    if (formattedNodes.length > 0) {
      const { error: nodeError } = await supabase
        .from("evidence_nodes")
        .upsert(formattedNodes, { onConflict: "id" });
      if (nodeError) throw nodeError;
    }

    // 4. Format Edges
    const formattedEdges = edges.map((e) => {
      const edgeId = e.id && isUuid(e.id) ? e.id : crypto.randomUUID();
      return {
        id: edgeId,
        case_id: caseId,
        source_node_id: e.source,
        target_node_id: e.target,
      };
    });

    const edgeIds = formattedEdges.map((e) => e.id);

    // 5. Xóa các edges không còn tồn tại
    if (edgeIds.length > 0) {
      await supabase
        .from("evidence_edges")
        .delete()
        .eq("case_id", caseId)
        .not("id", "in", `(${edgeIds.join(",")})`);
    } else {
      await supabase.from("evidence_edges").delete().eq("case_id", caseId);
    }

    // 6. Upsert Edges
    if (formattedEdges.length > 0) {
      const { error: edgeError } = await supabase
        .from("evidence_edges")
        .upsert(formattedEdges, { onConflict: "id" });
      if (edgeError) throw edgeError;
    }

    revalidatePath(`/studio/cases/${caseId}/evidence`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error saving evidence board:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getEvidenceBoard(caseId: string) {
  try {
    const supabase = await createClient();

    const { data: nodesData, error: nodeError } = await supabase
      .from("evidence_nodes")
      .select("*")
      .eq("case_id", caseId);

    if (nodeError) throw nodeError;

    const { data: edgesData, error: edgeError } = await supabase
      .from("evidence_edges")
      .select("*")
      .eq("case_id", caseId);

    if (edgeError) throw edgeError;

    // Reconstruct React Flow format
    const nodes = (nodesData || []).map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: n.position_x, y: n.position_y },
      data: {
        ...((n.logic_data as Record<string, unknown>) || {}),
        label: n.label,
        description: n.description,
        category: n.category,
      },
    }));

    const edges = (edgesData || []).map((e) => {
      const sourceNode = nodes.find((n) => n.id === e.source_node_id);
      const targetNode = nodes.find((n) => n.id === e.target_node_id);
      const isCoreToCore =
        sourceNode?.type === "question" && targetNode?.type === "question";

      return {
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        sourceHandle: "source-center",
        targetHandle: "target",
        type: "straight",
        animated: !isCoreToCore,
        style: isCoreToCore
          ? { stroke: "#f43f5e", strokeWidth: 2 }
          : { stroke: "#e4e4e7", strokeWidth: 2, strokeDasharray: "5,5" },
      };
    });

    return { success: true, nodes, edges };
  } catch (error: unknown) {
    console.error("Error fetching evidence board:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      nodes: [],
      edges: [],
    };
  }
}

// ==============================================================================
// Reinvestigate Hotspots
// ==============================================================================

export interface ReinvestigateHotspotConfig {
  id: string;
  num: number;
  photoNumber?: string;
  title?: string;
  x: number;
  y: number;
  imageUrl: string;
  soundFile: string;
  soundCaption: string;
}

export async function saveReinvestigationHotspots(
  caseId: string,
  hotspots: ReinvestigateHotspotConfig[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdminAuth();
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from("reinvestigation_hotspots")
      .upsert(
        {
          case_slug: caseId,
          hotspots,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "case_slug" },
      );

    if (dbError) throw dbError;
    revalidatePath(`/evidence/web`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error saving reinvestigation hotspots:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getReinvestigationHotspots(caseId: string): Promise<{
  success: boolean;
  hotspots: ReinvestigateHotspotConfig[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("boardgame_pins")
      .select("*")
      .eq("case_id", caseId)
      .like("id", `reinvestigate-${caseId}-%`);

    if (error) throw error;
    if (!data || data.length === 0) {
      return { success: true, hotspots: [] };
    }

    const hotspots: ReinvestigateHotspotConfig[] = data
      .map((row) => {
        const numPart =
          parseInt(row.id.replace(`reinvestigate-${caseId}-`, ""), 10) || 1;
        return {
          id: row.id,
          num: numPart,
          title: row.label || `Điểm #${numPart}`,
          x: row.position_x,
          y: row.position_y,
          imageUrl: row.photo_url || "",
          soundFile: row.color || "sat_soat.mp3",
          soundCaption: row.detail || "",
        };
      })
      .sort((a, b) => a.num - b.num);

    return { success: true, hotspots };
  } catch (error: unknown) {
    console.error("Error fetching reinvestigation hotspots:", error);
    return {
      success: false,
      hotspots: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
