"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { createNewCase } from "@/lib/actions/case-actions";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

export function CreateCaseButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("Mật vụ mới (Bản nháp)");
  const [customSlug, setCustomSlug] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const res = await createNewCase(title, customSlug || undefined);
    if (res.success && res.data) {
      toast.success("Tạo vụ án mới thành công!");
      router.push(`/studio/cases/${res.data.slug}`);
      setIsOpen(false);
      setIsPending(false);
    } else {
      toast.error(res.error || "Không thể tạo vụ án");
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 font-medium rounded-md hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="size-4" />
        Create New Case
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-semibold text-zinc-100">Tạo Vụ Án Mới</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Tên vụ án *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Kỳ án ven sông..."
                  className="w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Mã hệ thống (Slug tùy chọn)
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="Để trống để tự sinh mã (hoặc vd: e2e_v2_...)"
                  className="w-full bg-zinc-950 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Chỉ gồm chữ thường, số và dấu gạch dưới.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-md text-xs hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/20"
                >
                  {isPending ? "Đang tạo..." : "Xác nhận tạo vụ án"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
