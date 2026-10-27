"use client";

import { useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import type { DbCaseCheckpoint } from "@/lib/types/database";
import type {
  CheckpointStudioDraft,
  EpilogueStoryItem,
} from "@/lib/types/checkpoint-studio";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CheckpointEpilogueFormProps {
  draft: CheckpointStudioDraft;
  checkpoints?: DbCaseCheckpoint[];
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

export function CheckpointEpilogueForm({
  draft,
  checkpoints = [],
  onChange,
}: CheckpointEpilogueFormProps) {
  const stories: EpilogueStoryItem[] =
    Array.isArray(draft.answerConfig.epilogueStories) &&
    draft.answerConfig.epilogueStories.length > 0
      ? draft.answerConfig.epilogueStories
      : [
          {
            id: "cp-epilogue-1",
            title: "Phần 1",
            monologue: draft.narrative || "",
          },
        ];

  const [activeIdx, setActiveIdx] = useState(0);
  const currentStory = stories[activeIdx] || stories[0];

  const updateStories = (next: EpilogueStoryItem[]) => {
    onChange({
      answerConfig: {
        ...draft.answerConfig,
        epilogueStories: next,
      },
    });
  };

  const handleUpdateCurrentMonologue = (value: string) => {
    const next = stories.map((s, idx) => {
      if (idx === activeIdx) {
        return { ...s, monologue: value };
      }
      return s;
    });
    updateStories(next);
  };

  const handleAddStory = () => {
    const num = stories.length + 1;
    const nextStory: EpilogueStoryItem = {
      id: `cp-epilogue-${num}`,
      title: `Phần ${num}`,
      monologue: "",
    };
    const next = [...stories, nextStory];
    updateStories(next);
    setActiveIdx(next.length - 1);
  };

  const handleRemoveStory = (idxToRemove: number) => {
    if (stories.length <= 1) return;
    const next = stories
      .filter((_, idx) => idx !== idxToRemove)
      .map((s, idx) => ({
        ...s,
        title: `Phần ${idx + 1}`,
      }));
    updateStories(next);
    setActiveIdx((prev) => Math.min(prev, next.length - 1));
  };

  return (
    <div className="space-y-3">
      {/* Chapter Tabs & Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {stories.map((story, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={story.id || idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border",
                  isActive
                    ? "border-amber-400 bg-amber-500/15 text-amber-300 shadow-sm"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200",
                )}
              >
                <BookOpen className="size-3" />
                <span>Phần {idx + 1}</span>
              </button>
            );
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddStory}
            className="h-7 border-dashed border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs px-2"
            title="Thêm phần mới"
          >
            <Plus className="size-3" />
            <span>Thêm phần</span>
          </Button>
        </div>

        <span className="text-[10px] font-mono text-zinc-500">
          Tổng cộng: {stories.length} phần
        </span>
      </div>

      {/* Editor nội dung phẳng, đồng bộ font chuẩn hệ thống, không scroll */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Nội dung Phần {activeIdx + 1}
          </label>
          {stories.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveStory(activeIdx)}
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Xóa phần này"
            >
              <Trash2 className="size-3" />
              <span>Xóa phần này</span>
            </button>
          )}
        </div>

        <AutoGrowTextarea
          value={currentStory.monologue}
          onChange={(e) => handleUpdateCurrentMonologue(e.target.value)}
          minRows={4}
          className="min-h-24 text-xs leading-relaxed text-zinc-200 focus:border-amber-400"
        />
      </div>

      {/* Phụ thuộc depends_on cho Hậu án */}
      {checkpoints && checkpoints.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-white/10">
          <label className="block text-xs font-semibold text-zinc-300">
            Phụ thuộc
          </label>
          <select
            value={(draft.dependsOn && draft.dependsOn[0]) || ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange({ dependsOn: val ? [val] : [] });
            }}
            className="w-full h-8 px-2 rounded-md bg-black/40 border border-white/10 text-xs text-zinc-200 outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">-- Không phụ thuộc (Mở sẵn) --</option>
            {checkpoints
              .filter((c) => c.checkpoint_id !== draft.checkpointId)
              .map((c) => (
                <option key={c.checkpoint_id} value={c.checkpoint_id}>
                  {c.title || "Checkpoint không tên"}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
}
