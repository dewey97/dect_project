"use client";

import React, { useState } from "react";
import { HeroInteractive } from "@/components/investigation/hero-interactive";
import { useBoardEditor } from "./use-board-editor";
import { BoardNodeForm } from "./board-node-form";
import { Button } from "@/components/ui/button";
import {
  Undo2,
  Redo2,
  Save,
  Plus,
  Play,
  Layers,
  Sparkles,
  RotateCcw,
  RotateCw,
  Minus,
} from "lucide-react";
import { launchPlaytestFromCheckpoint } from "@/lib/checkpoints/case-playtest";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import { toast } from "@/components/ui/toast";

interface BoardEditorProps {
  caseId: string;
  checkpoints?: DbCaseCheckpoint[];
}

export function BoardEditor({ caseId, checkpoints = [] }: BoardEditorProps) {
  const {
    isLoading,
    isSaving,
    hasUnsavedChanges,
    displayPins,
    connections,
    selectedNodeId,
    selectedNode,
    setSelectedNodeId,
    handlePositionChange,
    handleConnectPins,
    handleDeleteConnection,
    handleSaveNode,
    handleDeleteNode,
    handleSaveAll,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleAdjustNodeTransform,
  } = useBoardEditor(caseId);

  const [isCreatingNode, setIsCreatingNode] = useState(false);

  const handlePlaytest = () => {
    const firstCp = checkpoints[0];
    if (firstCp) {
      launchPlaytestFromCheckpoint({
        caseId,
        targetCheckpoint: firstCp,
        allCheckpoints: checkpoints,
      });
      toast.success("Đang mở màn chơi thử nghiệm từ bảng điều tra");
    } else {
      window.open(`/evidence/web?case_id=${caseId}`, "_blank");
    }
  };

  const handleCreateNewNode = async () => {
    if (isLoading || isCreatingNode) return;
    setIsCreatingNode(true);
    try {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const newId = `${caseId}:custom:node_${randomSuffix}`;
      const draft = {
        id: newId,
        caseId,
        nodeKind: "custom" as const,
        title: "Ghim mới",
        config: {
          pin_title: "Ghim mới",
          position: {
            desktop: { x: 0.5, y: 0.5 },
            mobile: { x: 0.5, y: 0.5 },
          },
        },
      };
      const ok = await handleSaveNode(draft);
      if (ok) setSelectedNodeId(newId);
    } finally {
      setIsCreatingNode(false);
    }
  };

  return (
    <div
      data-studio-ready={isLoading ? "false" : "true"}
      className="flex h-full min-h-0 w-full flex-col bg-[#0c0d12]"
    >
      {/* 1. Header Toolbar của Board Studio */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#0f1016] px-4">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-100">
            Bảng điều tra (Board Studio)
          </span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            {displayPins.length} nodes
          </span>
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Chưa lưu
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Hoàn tác (Ctrl+Z)"
            className="size-8 p-0 text-zinc-400 hover:text-white"
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Làm lại (Ctrl+Shift+Z)"
            className="size-8 p-0 text-zinc-400 hover:text-white"
          >
            <Redo2 className="size-4" />
          </Button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCreateNewNode}
            disabled={isLoading || isCreatingNode}
            className="gap-1 text-xs border-white/10 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
          >
            <Plus className="size-3.5 text-amber-400" />
            Thêm Node
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveAll}
            disabled={isSaving || !hasUnsavedChanges}
            className="gap-1.5 text-xs bg-amber-500 text-black font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            <Save className="size-3.5" />
            {isSaving ? "Đang lưu..." : "Lưu Bố Cục"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePlaytest}
            className="gap-1.5 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30"
          >
            <Play className="size-3.5 fill-current" />
            Chơi Thử
          </Button>
        </div>
      </header>

      {/* 2. Main Content Canvas & Node Form Inspector */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden relative">
        <div className="flex-1 h-full min-h-0 relative">
          {/* Thanh công cụ Quick Transform nổi ngay trên Canvas khi chọn 1 ghim */}
          {selectedNode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-[#16120e]/95 backdrop-blur-md rounded-lg border border-amber-500/50 shadow-2xl font-mono text-xs select-none">
              <span className="text-amber-200/90 font-bold max-w-[140px] truncate pr-1">
                {("title" in selectedNode ? selectedNode.title : ("label" in selectedNode ? selectedNode.label : "")) || "Ghim"}
              </span>

              <div className="h-4 w-px bg-white/15 mx-0.5" />

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, -2, 0)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Xoay nghiêng trái (-2°)"
              >
                <RotateCcw className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, 2, 0)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Xoay nghiêng phải (+2°)"
              >
                <RotateCw className="size-3.5" />
              </button>

              <div className="h-4 w-px bg-white/15 mx-0.5" />

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, 0, -0.1)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Thu nhỏ (-0.1x)"
              >
                <Minus className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleAdjustNodeTransform(selectedNode.id, 0, 0.1)}
                className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 transition-colors"
                title="Phóng to (+0.1x)"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          )}

          <HeroInteractive
            className="w-full h-full"
            controlledCaseId={caseId}
            customPins={displayPins}
            customConnections={connections}
            isEditMode={true}
            selectedPinId={selectedNodeId}
            onSelectPin={(id) => setSelectedNodeId(id)}
            onPinClick={(id) => setSelectedNodeId(id)}
            onPinPositionChange={handlePositionChange}
            onConnectPins={handleConnectPins}
            onDeleteConnection={handleDeleteConnection}
          />
        </div>

        {selectedNode && (
          <BoardNodeForm
            caseId={caseId}
            node={selectedNode}
            onSave={handleSaveNode}
            onDelete={handleDeleteNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}
