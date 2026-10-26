"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Trash2, Upload, UserRound } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  deleteCharacter,
  deleteCharacterAvatar,
  saveCharacter,
  uploadCharacterAvatar,
  type CaseCharacterDraft,
} from "@/lib/actions/character-actions";
import type {
  CaseCharacterRole,
  DbCase,
  DbCaseCharacter,
} from "@/lib/types/database";

const ROLE_LABELS: Record<CaseCharacterRole, string> = {
  victim: "Nạn nhân",
  suspect: "Nghi phạm",
  witness: "Nhân chứng",
  related: "Liên quan",
};

const ROLE_ORDER: CaseCharacterRole[] = [
  "victim",
  "suspect",
  "witness",
  "related",
];

const inputClass =
  "w-full rounded-md border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function toDraft(
  caseId: string,
  row?: DbCaseCharacter,
  nextSlot = 0,
): CaseCharacterDraft {
  return {
    id: row?.id,
    caseId,
    key: row?.key ?? "",
    name: row?.name ?? "",
    aliases: row?.aliases ?? [],
    role: row?.role ?? "suspect",
    description: row?.description ?? "",
    avatarCode: row?.avatar_code ?? "",
    avatarUrl: row?.avatar_url ?? null,
    avatarAssetPath: row?.avatar_asset_path ?? null,
    phones: row?.phones ?? [],
    slotIndex: row?.slot_index ?? nextSlot,
    device: row?.device ?? null,
  };
}

function splitList(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

interface CharactersStudioClientProps {
  initialCaseId: string;
  cases: DbCase[];
  initialCharacters: DbCaseCharacter[];
  loadError?: string;
}

export function CharactersStudioClient({
  initialCaseId,
  cases,
  initialCharacters,
  loadError,
}: CharactersStudioClientProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState(initialCharacters);
  const [draft, setDraft] = useState<CaseCharacterDraft>(() =>
    toDraft(initialCaseId, initialCharacters[0], initialCharacters.length),
  );
  const [aliasText, setAliasText] = useState(draft.aliases.join(", "));
  const [phoneText, setPhoneText] = useState(draft.phones.join(", "));
  const [isPending, startTransition] = useTransition();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!draft.key) {
      toast.error("Vui lòng nhập mã nhân vật trước khi tải ảnh.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await uploadCharacterAvatar(initialCaseId, draft.key, file);
      if (!res.success || !res.data) {
        toast.error(res.error || "Không tải được ảnh đại diện.");
        return;
      }
      const updatedUrl = res.data.url;
      const updatedPath = res.data.path;
      setDraft((prev) => ({
        ...prev,
        avatarUrl: updatedUrl,
        avatarAssetPath: updatedPath,
      }));
      setCharacters((prev) =>
        prev.map((c) =>
          c.key === draft.key
            ? { ...c, avatar_url: updatedUrl, avatar_asset_path: updatedPath }
            : c,
        ),
      );
      toast.success("Đã tải ảnh chân dung thành công.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải ảnh");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    if (!draft.key) return;
    if (!window.confirm("Xóa ảnh chân dung của nhân vật này?")) return;
    setIsUploadingAvatar(true);
    try {
      const res = await deleteCharacterAvatar(initialCaseId, draft.key);
      if (!res.success) {
        toast.error(res.error || "Không xóa được ảnh chân dung.");
        return;
      }
      setDraft((prev) => ({
        ...prev,
        avatarUrl: null,
        avatarAssetPath: null,
      }));
      setCharacters((prev) =>
        prev.map((c) =>
          c.key === draft.key
            ? { ...c, avatar_url: null, avatar_asset_path: null }
            : c,
        ),
      );
      toast.success("Đã xóa ảnh chân dung.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi xóa ảnh");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const grouped = useMemo(
    () =>
      ROLE_ORDER.map((role) => ({
        role,
        items: characters.filter((c) => c.role === role),
      })).filter((group) => group.items.length > 0),
    [characters],
  );

  const select = (row?: DbCaseCharacter) => {
    const next = toDraft(initialCaseId, row, characters.length);
    setDraft(next);
    setAliasText(next.aliases.join(", "));
    setPhoneText(next.phones.join(", "));
  };

  const update = <K extends keyof CaseCharacterDraft>(
    field: K,
    value: CaseCharacterDraft[K],
  ) => setDraft((prev) => ({ ...prev, [field]: value }));

  const updateDevice = (
    field: "label" | "model" | "lastUpdated" | "description",
    value: string,
  ) =>
    setDraft((prev) => ({
      ...prev,
      device: { ...(prev.device || {}), [field]: value },
    }));

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveCharacter({
        ...draft,
        aliases: splitList(aliasText),
        phones: splitList(phoneText),
        device: draft.role === "victim" ? draft.device : null,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setCharacters((prev) =>
        [...prev.filter((c) => c.id !== res.data.id), res.data].sort(
          (a, b) => a.slot_index - b.slot_index,
        ),
      );
      select(res.data);
      toast.success(`Đã lưu ${res.data.name}`);
    });
  };

  const handleDelete = () => {
    if (!draft.id || !window.confirm(`Xóa nhân vật "${draft.name}"?`)) return;
    const id = draft.id;
    startTransition(async () => {
      const res = await deleteCharacter(id);
      if (!res.success) {
        toast.error(res.error || "Không xóa được nhân vật.");
        return;
      }
      const remaining = characters.filter((c) => c.id !== id);
      setCharacters(remaining);
      select(remaining[0]);
      toast.success("Đã xóa nhân vật");
    });
  };

  const isBusy = isPending || isUploadingAvatar;

  return (
    <div
      data-studio-ready={isBusy ? "false" : "true"}
      className="mx-auto max-w-6xl space-y-6"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Nhân vật</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Nạn nhân, nghi phạm và nhân chứng của vụ án. Gameplay dùng danh sách
            này để nhận diện tên và số điện thoại.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          Vụ án
          <select
            value={initialCaseId}
            onChange={(e) =>
              router.push(`/studio/characters?case=${e.target.value}`)
            }
            className="min-h-11 rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-200"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.title} ({c.slug})
              </option>
            ))}
          </select>
        </label>
      </header>

      {loadError && (
        <p
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {loadError}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <button
            type="button"
            onClick={() => select()}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-dashed border-white/15 text-sm text-zinc-300 hover:bg-white/5"
          >
            <Plus className="size-4" /> Thêm nhân vật
          </button>
          {grouped.length === 0 && (
            <p className="text-sm text-zinc-500">Vụ án chưa có nhân vật.</p>
          )}
          {grouped.map((group) => (
            <section key={group.role}>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {ROLE_LABELS[group.role]}
              </h2>
              <ul className="divide-y divide-white/5 rounded-md border border-white/10">
                {group.items.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => select(c)}
                      aria-current={draft.id === c.id}
                      className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm text-zinc-300 hover:bg-white/5 aria-[current=true]:bg-primary/15 aria-[current=true]:text-zinc-50"
                    >
                      {c.avatar_url ? (
                        <img
                          src={c.avatar_url}
                          alt={c.name}
                          className="size-5 rounded-full object-cover shrink-0 border border-white/20"
                        />
                      ) : (
                        <UserRound className="size-4 shrink-0 text-zinc-500" />
                      )}
                      <span className="truncate">{c.name}</span>
                      <span className="ml-auto font-mono text-xs text-zinc-500">
                        {c.key}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </aside>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4 rounded-xl border border-white/10 bg-zinc-950/50 p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-zinc-400">Họ tên</span>
              <input
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
                required
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-zinc-400">Mã (không dấu, vd: vu)</span>
              <input
                value={draft.key}
                onChange={(e) => update("key", e.target.value)}
                disabled={Boolean(draft.id)}
                className={`${inputClass} font-mono disabled:opacity-60`}
                required
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-zinc-400">Vai trò</span>
              <select
                value={draft.role}
                onChange={(e) =>
                  update("role", e.target.value as CaseCharacterRole)
                }
                className={inputClass}
              >
                {ROLE_ORDER.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-zinc-400">Thứ tự trên bàn điều tra</span>
              <input
                type="number"
                min={0}
                value={draft.slotIndex}
                onChange={(e) => update("slotIndex", Number(e.target.value))}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">Mô tả / quan hệ</span>
            <input
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">
              Tên gọi khác (phân cách bằng dấu phẩy)
            </span>
            <textarea
              rows={2}
              value={aliasText}
              onChange={(e) => setAliasText(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">Số điện thoại</span>
            <input
              value={phoneText}
              onChange={(e) => setPhoneText(e.target.value)}
              placeholder="0988200991, 0912331888"
              inputMode="tel"
              className={inputClass}
            />
          </label>

          {/* Khối Ảnh chân dung (Avatar Upload + Preview + Delete) */}
          <div className="space-y-2 rounded-lg border border-white/10 bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">
                Ảnh chân dung (Avatar)
              </span>
              {draft.avatarAssetPath && (
                <span className="font-mono text-xs text-zinc-500 truncate max-w-xs">
                  {draft.avatarAssetPath}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-zinc-950 flex items-center justify-center shadow-inner">
                {draft.avatarUrl ? (
                  <img
                    src={draft.avatarUrl}
                    alt={draft.name || "Avatar"}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound className="size-8 text-zinc-600" />
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    className={`inline-flex min-h-9 items-center gap-2 rounded-md border border-white/15 bg-zinc-900 px-3 text-xs font-medium text-zinc-200 hover:bg-white/5 cursor-pointer ${
                      !draft.key || isUploadingAvatar
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : ""
                    }`}
                  >
                    <Upload className="size-3.5" />
                    <span>
                      {draft.avatarUrl ? "Đổi ảnh khác" : "Tải ảnh lên"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={!draft.key || isUploadingAvatar}
                      onChange={handleAvatarFileChange}
                      className="sr-only"
                    />
                  </label>

                  {draft.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleDeleteAvatar}
                      disabled={isUploadingAvatar || isPending}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-red-500/30 px-3 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" /> Xóa ảnh
                    </button>
                  )}
                </div>

                <p className="text-xs text-zinc-500">
                  {!draft.key
                    ? "⚠️ Nhập mã nhân vật trước để tải ảnh."
                    : "Hỗ trợ JPG, PNG, WEBP. Tự động lưu vào bucket avatars."}
                </p>
              </div>
            </div>
          </div>

          {draft.role === "victim" && (
            <fieldset className="grid gap-3 rounded-md border border-white/10 p-3 sm:grid-cols-4">
              <legend className="px-1 text-xs uppercase tracking-wider text-zinc-500">
                Điện thoại tang vật (Nạn nhân)
              </legend>
              <label className="space-y-1 text-xs">
                <span className="text-zinc-400">Nhãn</span>
                <input
                  value={draft.device?.label ?? ""}
                  onChange={(e) => updateDevice("label", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-zinc-400">Đời máy</span>
                <input
                  value={draft.device?.model ?? ""}
                  onChange={(e) => updateDevice("model", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-zinc-400">Thời điểm</span>
                <input
                  value={draft.device?.lastUpdated ?? ""}
                  onChange={(e) => updateDevice("lastUpdated", e.target.value)}
                  placeholder="24/07/2016 // 17:55"
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-zinc-400">Mô tả</span>
                <input
                  value={draft.device?.description ?? ""}
                  onChange={(e) => updateDevice("description", e.target.value)}
                  className={inputClass}
                />
              </label>
            </fieldset>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              <Save className="size-4" />{" "}
              {draft.id ? "Lưu thay đổi" : "Tạo nhân vật"}
            </button>
            {draft.id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-red-500/30 px-4 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-60"
              >
                <Trash2 className="size-4" /> Xóa
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
