"use client";

import type {
  DbCaseCheckpoint,
  DbCaseDossier,
  DbCaseCharacter,
  BoardConfig,
  DbCaseBoardNode,
} from "@/lib/types/database";
import {
  type CheckpointStudioDraft,
} from "@/lib/types/checkpoint-studio";
import {
  type AvailableDocumentItem,
} from "@/lib/actions/dossier-config-actions";
import { cn } from "@/lib/utils";
import { CheckpointEditor } from "./checkpoint-editor";
import { CharacterEditor } from "./character-editor";
import type { PinPoint } from "@/components/investigation/board/renderer/hero-interactive";
import { BoardNodeForm } from "./board/board-node-form";
import { Button } from "@/components/ui/button";
import {
  Save,
  Plus,
  Play,
  Pin,
  Sparkles,
  Layers,
  ChevronDown,
} from "lucide-react";
import { BoardNodeDraft } from "@/lib/actions/board-actions";
import { Dispatch,SetStateAction } from "react";

export interface CheckpointStudioInspectorProps {
  sidebarWidth: number;
  isResizing: boolean;
  isEditingBoardNode: boolean;
  selectedNode: DbCaseBoardNode | PinPoint | null;
  caseId: string;
  handleSaveNode: (draft: BoardNodeDraft) => Promise<boolean>;
  handleDeleteNode: (nodeId: string) => Promise<boolean>;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  handleUpdateNodeLocal: (nodeId: string, patch: { title?: string; config?: Partial<BoardConfig>; }) => void;
  setInspectorTab: Dispatch<SetStateAction<"checkpoints" | "characters" | "indictment" | "epilogue">>;
  setSelectedCharacter: Dispatch<SetStateAction<DbCaseCharacter | null>>;
  draft: CheckpointStudioDraft | null;
  investigationCheckpoints: DbCaseCheckpoint[];
  selectRow: (row: DbCaseCheckpoint) => boolean;
  inspectorTab: "checkpoints" | "characters" | "indictment" | "epilogue";
  selectedCharacter: DbCaseCharacter | null;
  characters: DbCaseCharacter[];
  handleOpenSpecialCheckpoint: (kind: "indictment" | "epilogue") => void;
  currentSelectCheckpointId: string;
  rows: DbCaseCheckpoint[];
  handleSaveCharacter: (savedChar: DbCaseCharacter) => Promise<void>;
  handleDeleteCharacter: (charId: string) => Promise<void>;
  handleCharacterLiveDraftChange: (updatedChar: DbCaseCharacter) => void;
  handleCharacterInterrogationChange: (interrogationDraft: CheckpointStudioDraft) => void;
  dossiers: DbCaseDossier[];
  availableDocs: AvailableDocumentItem[];
  updateDraft: (patch: Partial<CheckpointStudioDraft>) => void;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handlePlaytest: (checkpointId?: string) => void;
  isSaving: boolean;
  formDirty: boolean;
}

export function CheckpointStudioInspector({
  sidebarWidth,
  isResizing,
  isEditingBoardNode,
  selectedNode,
  caseId,
  handleSaveNode,
  handleDeleteNode,
  setSelectedNodeId,
  handleUpdateNodeLocal,
  setInspectorTab,
  setSelectedCharacter,
  draft,
  investigationCheckpoints,
  selectRow,
  inspectorTab,
  selectedCharacter,
  characters,
  handleOpenSpecialCheckpoint,
  currentSelectCheckpointId,
  rows,
  handleSaveCharacter,
  handleDeleteCharacter,
  handleCharacterLiveDraftChange,
  handleCharacterInterrogationChange,
  dossiers,
  availableDocs,
  updateDraft,
  handleSave,
  handleDelete,
  handlePlaytest,
  isSaving,
  formDirty,
}: CheckpointStudioInspectorProps) {
  return (
    <div
          style={{ width: `${sidebarWidth}px` }}
          className={cn(
            "flex h-[55%] min-h-0 shrink-0 flex-col md:h-full max-w-[85vw]",
            !isResizing && "transition-[width] duration-75 ease-out",
          )}
        >
          {isEditingBoardNode && selectedNode ? (
            <BoardNodeForm
              caseId={caseId}
              node={selectedNode}
              onSave={handleSaveNode}
              onDelete={handleDeleteNode}
              onClose={() => setSelectedNodeId(null)}
              onLiveUpdate={handleUpdateNodeLocal}
            />
          ) : (
            <div className="flex h-full w-full min-h-0 flex-col bg-[#0c0c10] border-t border-white/10 md:border-l md:border-t-0">
              {/* Segmented Switcher Tab giữa Checkpoint, Nhân vật, Kết luận và Hậu án */}
              <div className="shrink-0 p-2.5 bg-[#111118] border-b border-white/10 space-y-2 select-none">
                {/* Hàng 1: 4 Tabs phân định rõ ràng */}
                <div className="grid grid-cols-4 gap-1 bg-black/50 p-1 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectorTab("checkpoints");
                      setSelectedCharacter(null);
                      if (
                        (!draft ||
                          draft.kind === "indictment" ||
                          draft.kind === "epilogue") &&
                        investigationCheckpoints.length > 0
                      ) {
                        selectRow(investigationCheckpoints[0]);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-center py-1.5 px-1 rounded-md text-xs font-semibold transition-all cursor-pointer truncate",
                      inspectorTab === "checkpoints"
                        ? "bg-amber-500 text-black shadow-md font-bold"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                    )}
                  >
                    Checkpoint ({investigationCheckpoints.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInspectorTab("characters");
                      if (!selectedCharacter && characters.length > 0) {
                        setSelectedCharacter(characters[0]);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-center py-1.5 px-1 rounded-md text-xs font-semibold transition-all cursor-pointer truncate",
                      inspectorTab === "characters"
                        ? "bg-purple-600 text-white shadow-md font-bold"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                    )}
                  >
                    Nhân vật ({characters.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSpecialCheckpoint("indictment")}
                    className={cn(
                      "flex items-center justify-center py-1.5 px-1 rounded-md text-xs font-semibold transition-all cursor-pointer truncate",
                      inspectorTab === "indictment"
                        ? "bg-rose-600 text-white shadow-md font-bold"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                    )}
                  >
                    Kết luận
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSpecialCheckpoint("epilogue")}
                    className={cn(
                      "flex items-center justify-center py-1.5 px-1 rounded-md text-xs font-semibold transition-all cursor-pointer truncate",
                      inspectorTab === "epilogue"
                        ? "bg-emerald-600 text-white shadow-md font-bold"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                    )}
                  >
                    Hậu án
                  </button>
                </div>

                {/* Hàng 2: Dropdown động tương ứng */}
                {inspectorTab === "characters" ? (
                  <div className="relative">
                    <select
                      value={
                        selectedCharacter?.id || selectedCharacter?.key || ""
                      }
                      onChange={(e) => {
                        const found = characters.find(
                          (c) =>
                            c.id === e.target.value || c.key === e.target.value,
                        );
                        if (found) {
                          setSelectedCharacter(found);
                          setInspectorTab("characters");
                          setSelectedNodeId(null);
                        }
                      }}
                      className="w-full h-8 pl-3 pr-8 rounded-md bg-[#14141c] border border-white/10 hover:border-purple-500/50 text-xs text-zinc-200 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 cursor-pointer font-sans appearance-none transition-colors"
                      title="Chọn nhân vật để điều chỉnh"
                    >
                      <option
                        value=""
                        disabled
                        className="bg-[#14141c] text-zinc-400"
                      >
                        -- Chọn nhân vật ({characters.length}) --
                      </option>
                      {characters.map((c) => {
                        const roleText =
                          c.role === "victim"
                            ? "Nạn nhân"
                            : c.role === "suspect"
                              ? "Nghi phạm"
                              : c.role === "witness"
                                ? "Nhân chứng"
                                : "Liên quan";
                        return (
                          <option
                            key={c.id || c.key}
                            value={c.id || c.key}
                            className="bg-[#14141c] text-zinc-100 py-1.5"
                          >
                            {c.name || "Không tên"} ({roleText})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 pointer-events-none" />
                  </div>
                ) : inspectorTab === "checkpoints" ? (
                  <div className="relative">
                    <select
                      value={currentSelectCheckpointId}
                      onChange={(e) => {
                        if (e.target.value === "__new__") return;
                        const found = investigationCheckpoints.find(
                          (r) =>
                            r.id === e.target.value ||
                            r.checkpoint_id === e.target.value,
                        );
                        if (found) {
                          selectRow(found);
                          setSelectedCharacter(null);
                          setInspectorTab("checkpoints");
                          setSelectedNodeId(null);
                        }
                      }}
                      className="w-full h-8 pl-3 pr-8 rounded-md bg-[#14141c] border border-white/10 hover:border-amber-500/50 text-xs text-zinc-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 cursor-pointer font-sans appearance-none transition-colors"
                      title="Chọn checkpoint để edit"
                    >
                      <option
                        value=""
                        disabled
                        className="bg-[#14141c] text-zinc-400"
                      >
                        -- Chọn checkpoint ({investigationCheckpoints.length}) --
                      </option>
                      {draft &&
                        !draft.id &&
                        !investigationCheckpoints.some(
                          (r) => r.checkpoint_id === draft.checkpointId,
                        ) && (
                          <option
                            value="__new__"
                            className="bg-[#14141c] text-amber-300"
                          >
                            + Đang tạo:{" "}
                            {draft.title ||
                              draft.checkpointId ||
                              "Checkpoint mới"}
                          </option>
                        )}
                      {investigationCheckpoints.map((cp) => {
                        const kindBadge =
                          cp.kind === "phone_lookup"
                            ? "Tra cứu"
                            : cp.kind === "suspect_interrogation" ||
                                cp.kind === "evidence_picker"
                              ? "Chọn tài liệu"
                              : cp.kind === "code" || cp.kind === "time"
                                ? "So khớp"
                                : cp.kind === "choice"
                                  ? "Trắc nghiệm"
                                  : cp.kind === "text"
                                    ? "Tự do"
                                    : "Chọn tài liệu";
                        return (
                          <option
                            key={cp.id || cp.checkpoint_id}
                            value={cp.id || cp.checkpoint_id}
                            className="bg-[#14141c] text-zinc-100 py-1.5"
                          >
                            {kindBadge} · {cp.title ||
                              cp.checkpoint_id ||
                              "Checkpoint không tên"}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 pointer-events-none" />
                  </div>
                ) : null}
              </div>

              {/* Nội dung Inspector */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {inspectorTab === "characters" ? (
                  <CharacterEditor
                    caseId={caseId}
                    character={selectedCharacter}
                    allCharacters={characters}
                    checkpoints={rows}
                    onSave={handleSaveCharacter}
                    onDelete={handleDeleteCharacter}
                    onDraftChange={handleCharacterLiveDraftChange}
                    onInterrogationChange={handleCharacterInterrogationChange}
                    onOpenInterrogation={(cp) => {
                      selectRow(cp);
                      setSelectedCharacter(null);
                      setInspectorTab("checkpoints");
                    }}
                    onClose={() => {
                      setSelectedCharacter(null);
                      setInspectorTab("checkpoints");
                    }}
                  />
                ) : draft ? (
                  <CheckpointEditor
                    draft={draft}
                    dossiers={dossiers}
                    characters={characters}
                    checkpoints={rows}
                    availableDocs={availableDocs}
                    onChange={updateDraft}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onPlaytest={() => handlePlaytest(draft.checkpointId)}
                    isSaving={isSaving}
                    isDirty={formDirty}
                  />
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-zinc-500">
                    <p className="text-xs font-medium text-zinc-300">
                      Chưa chọn mục nào
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500 max-w-[240px]">
                      Bấm vào checkpoint trên sơ đồ hoặc ghim trên bảng để chỉnh
                      sửa.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
  );
}
