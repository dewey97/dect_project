"use client";

import { useState } from "react";
import { BookOpen, Plus, Trash2, FileText } from "lucide-react";
import type { CheckpointStudioDraft, EpilogueStoryItem } from "@/lib/types/checkpoint-studio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CheckpointEpilogueFormProps {
  draft: CheckpointStudioDraft;
  onChange: (patch: Partial<CheckpointStudioDraft>) => void;
}

export function CheckpointEpilogueForm({
  draft,
  onChange,
}: CheckpointEpilogueFormProps) {
  const stories: EpilogueStoryItem[] = Array.isArray(draft.answerConfig.epilogueStories) && draft.answerConfig.epilogueStories.length > 0
    ? draft.answerConfig.epilogueStories
    : [
        {
          id: "cp-epilogue-1",
          title: "Hậu Án I: Kết Cục Nhân Vật",
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

  const handleUpdateCurrent = (field: "title" | "monologue" | "id", value: string) => {
    const next = stories.map((s, idx) => {
      if (idx === activeIdx) {
        return { ...s, [field]: value };
      }
      return s;
    });
    updateStories(next);
  };

  const handleAddStory = () => {
    const num = stories.length + 1;
    const nextStory: EpilogueStoryItem = {
      id: `cp-epilogue-${num}`,
      title: `Hậu Án ${num}: Nhân Vật Mới`,
      monologue: "",
    };
    const next = [...stories, nextStory];
    updateStories(next);
    setActiveIdx(next.length - 1);
  };

  const handleRemoveStory = (idxToRemove: number) => {
    if (stories.length <= 1) return;
    const next = stories.filter((_, idx) => idx !== idxToRemove);
    updateStories(next);
    setActiveIdx((prev) => Math.min(prev, next.length - 1));
  };

  return (
    <div className="space-y-4">
      {/* Chapter Tabs / Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 pb-2.5">
        {stories.map((story, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={story.id || idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border",
                isActive
                  ? "border-amber-400 bg-amber-500/15 text-amber-300 shadow-sm"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200",
              )}
            >
              <BookOpen className="size-3" />
              <span className="truncate max-w-[120px]">
                {story.title ? story.title.replace(/^Hậu Án\s*[^:]*:\s*/i, "") : `Phần ${idx + 1}`}
              </span>
            </button>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddStory}
          className="h-7 border-dashed border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs px-2"
          title="Thêm một phần hậu án mới"
        >
          <Plus className="size-3" />
          <span>+ Thêm phần</span>
        </Button>
      </div>

      {/* Active Chapter Editor */}
      <div className="space-y-3 rounded-xl border border-white/10 bg-[#121218] p-3.5 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 font-mono text-xs font-bold text-amber-400">
              {activeIdx + 1}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Biên tập nội dung chương hậu án
            </span>
          </div>

          {stories.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveStory(activeIdx)}
              className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-zinc-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
              title="Xóa phần hậu án này"
            >
              <Trash2 className="size-3" />
              <span>Xóa phần này</span>
            </button>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Tiêu đề chương hậu án <span className="text-amber-400">*</span>
          </label>
          <Input
            value={currentStory.title}
            onChange={(e) => handleUpdateCurrent("title", e.target.value)}
            placeholder="vd: Hậu Án I: Trần Thị Hà & Bản Án Lương Tâm…"
            className="border-white/10 bg-black/40 text-xs font-medium text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Văn bản câu chuyện (Ký sự hậu án) <span className="text-amber-400">*</span>
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              {currentStory.monologue.length} ký tự
            </span>
          </div>
          <Textarea
            value={currentStory.monologue}
            onChange={(e) => handleUpdateCurrent("monologue", e.target.value)}
            placeholder="Gõ nội dung câu chuyện hậu án tại đây. Người chơi sẽ đọc đoạn văn này sau khi phá án thành công…"
            className="min-h-[220px] resize-y border-white/10 bg-black/40 p-3 font-serif text-sm leading-relaxed text-zinc-200 placeholder:font-sans placeholder:text-xs placeholder:text-zinc-600 focus:border-amber-400"
          />
        </div>
      </div>
    </div>
  );
}
