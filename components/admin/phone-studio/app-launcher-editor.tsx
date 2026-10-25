"use client";

import React, { useState, useTransition } from "react";
import {
  Grid,
  Plus,
  Trash2,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
  Layers,
} from "lucide-react";
import type { DbCasePhoneApp } from "@/lib/types/database";
import {
  upsertPhoneApp,
  deletePhoneApp,
  reorderPhoneApps,
  uploadPhoneAsset,
} from "@/lib/actions/phone-actions";
import { DEFAULT_APP_ICONS } from "@/components/phone-engine/system/home-screen";

interface AppLauncherEditorProps {
  caseId: string;
  initialApps: DbCasePhoneApp[];
  checkpoints?: Array<{ checkpoint_id: string; title: string }>;
  onAppsChange: (apps: DbCasePhoneApp[]) => void;
}

const KNOWN_APP_TYPES = [
  { type: "photos", label: "Ảnh (Photos)" },
  { type: "camera", label: "Camera" },
  { type: "maps", label: "Bản đồ (Maps)" },
  { type: "notes", label: "Ghi chú (Notes)" },
  { type: "banking", label: "Ngân hàng (Banking)" },
  { type: "flappybird", label: "Flappy Bird" },
  { type: "tetris", label: "Xếp Gạch (Tetris)" },
  { type: "snake", label: "Snake '97" },
  { type: "game2048", label: "2048" },
  { type: "minesweeper", label: "Dò Mìn (Minesweeper)" },
  { type: "settings", label: "Cài đặt (Settings)" },
  { type: "phone", label: "Điện thoại (Phone)" },
  { type: "messages", label: "Tin nhắn (Messages)" },
  { type: "contacts", label: "Danh bạ (Contacts)" },
  { type: "safari", label: "Safari (Browser)" },
];

export function AppLauncherEditor({
  caseId,
  initialApps,
  checkpoints = [],
  onAppsChange,
}: AppLauncherEditorProps) {
  const [apps, setApps] = useState<DbCasePhoneApp[]>(initialApps);
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{
    type: "idle" | "success" | "error";
    text?: string;
  }>({ type: "idle" });

  const [newAppType, setNewAppType] = useState<string>("notes");
  const [newAppName, setNewAppName] = useState<string>("");
  const [newIsDock, setNewIsDock] = useState<boolean>(false);

  // Filter grid vs dock
  const gridApps = apps
    .filter((a) => !a.is_dock)
    .sort((a, b) => a.slot_index - b.slot_index);
  const dockApps = apps
    .filter((a) => a.is_dock)
    .sort((a, b) => a.slot_index - b.slot_index);

  const handleUpdateApp = (id: string, updates: Partial<DbCasePhoneApp>) => {
    const updated = apps.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setApps(updated);
    onAppsChange(updated);

    const target = updated.find((a) => a.id === id);
    if (!target) return;

    startTransition(async () => {
      const res = await upsertPhoneApp({
        id: target.id,
        case_slug: caseId,
        app_type: target.app_type,
        display_name: target.display_name,
        icon_url: target.icon_url,
        slot_index: target.slot_index,
        is_dock: target.is_dock,
        is_locked: target.is_locked,
        unlock_checkpoint_id: target.unlock_checkpoint_id,
        config: target.config,
      });
      if (!res.success) {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể cập nhật ứng dụng.",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn gỡ ứng dụng này khỏi màn hình chính?"))
      return;
    const filtered = apps.filter((a) => a.id !== id);
    setApps(filtered);
    onAppsChange(filtered);

    startTransition(async () => {
      const res = await deletePhoneApp(id);
      if (res.success) {
        setStatusMsg({ type: "success", text: "Đã gỡ ứng dụng." });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({ type: "error", text: res.error || "Lỗi xóa ứng dụng." });
      }
    });
  };

  const handleMove = (
    id: string,
    direction: "up" | "down",
    isDock: boolean,
  ) => {
    const group = isDock ? [...dockApps] : [...gridApps];
    const idx = group.findIndex((a) => a.id === id);
    if (idx < 0) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= group.length) return;

    // Swap slot indices
    const currentItem = group[idx];
    const targetItem = group[targetIdx];

    const tempSlot = currentItem.slot_index;
    currentItem.slot_index = targetItem.slot_index;
    targetItem.slot_index = tempSlot;

    const newApps = apps.map((a) => {
      if (a.id === currentItem.id) return currentItem;
      if (a.id === targetItem.id) return targetItem;
      return a;
    });

    setApps(newApps);
    onAppsChange(newApps);

    startTransition(async () => {
      const reorderPayload = group.map((item, index) => ({
        id: item.id,
        slot_index: index,
        is_dock: isDock,
      }));
      await reorderPhoneApps(caseId, reorderPayload);
    });
  };

  const handleAddApp = () => {
    const selectedKnown = KNOWN_APP_TYPES.find((k) => k.type === newAppType);
    const displayName =
      newAppName.trim() || selectedKnown?.label.split(" ")[0] || newAppType;

    const targetGroup = newIsDock ? dockApps : gridApps;
    const nextSlot =
      targetGroup.length > 0
        ? Math.max(...targetGroup.map((a) => a.slot_index)) + 1
        : 0;

    startTransition(async () => {
      const res = await upsertPhoneApp({
        case_slug: caseId,
        app_type: newAppType,
        display_name: displayName,
        icon_url: DEFAULT_APP_ICONS[newAppType] || null,
        slot_index: nextSlot,
        is_dock: newIsDock,
        is_locked: false,
        unlock_checkpoint_id: null,
      });

      if (res.success && res.data) {
        const updated = [...apps, res.data];
        setApps(updated);
        onAppsChange(updated);
        setNewAppName("");
        setStatusMsg({ type: "success", text: "Đã thêm ứng dụng mới!" });
        setTimeout(() => setStatusMsg({ type: "idle" }), 3000);
      } else {
        setStatusMsg({
          type: "error",
          text: res.error || "Không thể thêm app.",
        });
      }
    });
  };

  const handleSeedDefaults = () => {
    if (
      !confirm(
        "Khởi tạo 15 ứng dụng chuẩn iOS cho vụ án này? Các app trùng loại sẽ được giữ nguyên.",
      )
    )
      return;

    const defaultItems: Array<{
      app_type: string;
      display_name: string;
      is_dock: boolean;
      slot_index: number;
    }> = [
      // Grid
      {
        app_type: "photos",
        display_name: "Ảnh",
        is_dock: false,
        slot_index: 0,
      },
      {
        app_type: "camera",
        display_name: "Camera",
        is_dock: false,
        slot_index: 1,
      },
      {
        app_type: "maps",
        display_name: "Bản đồ",
        is_dock: false,
        slot_index: 2,
      },
      {
        app_type: "notes",
        display_name: "Ghi chú",
        is_dock: false,
        slot_index: 3,
      },
      {
        app_type: "banking",
        display_name: "Ngân hàng",
        is_dock: false,
        slot_index: 4,
      },
      {
        app_type: "flappybird",
        display_name: "Flappy Bird",
        is_dock: false,
        slot_index: 5,
      },
      {
        app_type: "tetris",
        display_name: "Xếp Gạch",
        is_dock: false,
        slot_index: 6,
      },
      {
        app_type: "snake",
        display_name: "Snake '97",
        is_dock: false,
        slot_index: 7,
      },
      {
        app_type: "game2048",
        display_name: "2048",
        is_dock: false,
        slot_index: 8,
      },
      {
        app_type: "minesweeper",
        display_name: "Dò Mìn",
        is_dock: false,
        slot_index: 9,
      },
      {
        app_type: "settings",
        display_name: "Cài đặt",
        is_dock: false,
        slot_index: 10,
      },
      // Dock
      {
        app_type: "phone",
        display_name: "Điện thoại",
        is_dock: true,
        slot_index: 0,
      },
      {
        app_type: "messages",
        display_name: "Tin nhắn",
        is_dock: true,
        slot_index: 1,
      },
      {
        app_type: "contacts",
        display_name: "Danh bạ",
        is_dock: true,
        slot_index: 2,
      },
      {
        app_type: "safari",
        display_name: "Safari",
        is_dock: true,
        slot_index: 3,
      },
    ];

    startTransition(async () => {
      let count = 0;
      for (const item of defaultItems) {
        const existing = apps.find((a) => a.app_type === item.app_type);
        if (!existing) {
          await upsertPhoneApp({
            case_slug: caseId,
            app_type: item.app_type,
            display_name: item.display_name,
            icon_url: DEFAULT_APP_ICONS[item.app_type] || null,
            slot_index: item.slot_index,
            is_dock: item.is_dock,
            is_locked: false,
          });
          count++;
        }
      }
      setStatusMsg({
        type: "success",
        text: `Đã khởi tạo xong ${count} ứng dụng mặc định.`,
      });
      window.location.reload();
    });
  };

  const handleIconUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    appId: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "icons");
      formData.append("caseSlug", caseId);

      const res = await uploadPhoneAsset(formData);
      if (res.success && res.data?.url) {
        handleUpdateApp(appId, { icon_url: res.data.url });
      } else {
        alert(res.error || "Lỗi tải ảnh icon.");
      }
    } catch (err: unknown) {
      alert(
        "Lỗi upload: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  const renderAppRow = (app: DbCasePhoneApp, idx: number, isDock: boolean) => {
    const iconSrc =
      app.icon_url ||
      DEFAULT_APP_ICONS[app.app_type] ||
      DEFAULT_APP_ICONS.settings;

    return (
      <div
        key={app.id}
        className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all text-xs"
      >
        {/* Reorder Arrows */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => handleMove(app.id, "up", isDock)}
            disabled={idx === 0}
            className="p-1 rounded hover:bg-zinc-800 disabled:opacity-20 cursor-pointer text-zinc-400"
            title="Đẩy lên trước"
          >
            <ChevronUp className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleMove(app.id, "down", isDock)}
            disabled={
              idx === (isDock ? dockApps.length - 1 : gridApps.length - 1)
            }
            className="p-1 rounded hover:bg-zinc-800 disabled:opacity-20 cursor-pointer text-zinc-400"
            title="Đẩy xuống sau"
          >
            <ChevronDown className="size-3.5" />
          </button>
        </div>

        {/* Icon Preview & Custom Icon Picker */}
        <div className="relative size-10 rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-700 group">
          <img
            src={iconSrc}
            alt={app.display_name}
            className="w-full h-full object-cover"
          />
          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <Upload className="size-4 text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleIconUpload(e, app.id)}
            />
          </label>
        </div>

        {/* App Info & Name Edit */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={app.display_name}
              onChange={(e) =>
                handleUpdateApp(app.id, { display_name: e.target.value })
              }
              className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs font-semibold text-zinc-100 focus:outline-none focus:border-sky-500 w-44"
              placeholder="Tên hiển thị"
            />
            <span className="font-mono text-[10px] text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded">
              {app.app_type}
            </span>
          </div>

          {/* Unlock Checkpoint Config */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <button
              type="button"
              onClick={() =>
                handleUpdateApp(app.id, { is_locked: !app.is_locked })
              }
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                app.is_locked
                  ? "bg-amber-950/60 border-amber-600/70 text-amber-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400"
              }`}
              title="Khóa ứng dụng cho đến khi người chơi giải xong Checkpoint"
            >
              {app.is_locked ? (
                <>
                  <Lock className="size-3" /> Bị khóa
                </>
              ) : (
                <>
                  <Unlock className="size-3" /> Mở sẵn
                </>
              )}
            </button>

            {app.is_locked && (
              <div className="flex items-center gap-1">
                <span>Mở khi xong:</span>
                <select
                  value={app.unlock_checkpoint_id || ""}
                  onChange={(e) =>
                    handleUpdateApp(app.id, {
                      unlock_checkpoint_id: e.target.value || null,
                    })
                  }
                  className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-700 rounded text-[11px] text-zinc-200 focus:outline-none focus:border-sky-500 max-w-[180px] truncate"
                >
                  <option value="">-- Chọn checkpoint --</option>
                  {checkpoints.map((cp) => (
                    <option key={cp.checkpoint_id} value={cp.checkpoint_id}>
                      {cp.checkpoint_id} ({cp.title})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Dock toggle */}
        <button
          type="button"
          onClick={() => handleUpdateApp(app.id, { is_dock: !app.is_dock })}
          className={`px-2 py-1 rounded text-[11px] border cursor-pointer transition-colors ${
            app.is_dock
              ? "bg-purple-950/60 border-purple-600/60 text-purple-300"
              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
          }`}
          title="Chuyển đổi giữa Màn hình chính và Thanh Dock dưới cùng"
        >
          {app.is_dock ? "Ở Dock" : "Ở Màn hình chính"}
        </button>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => handleDelete(app.id)}
          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
          title="Gỡ app khỏi máy"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Header & Quick Action */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Grid className="size-4 text-sky-400" />
            Trình quản lý Ứng dụng (App Launcher)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sắp xếp vị trí icon trên Màn hình chính, cấu hình Thanh Dock và điều
            kiện mở khóa ứng dụng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSeedDefaults}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-medium text-xs transition-all cursor-pointer border border-zinc-700"
            title="Tạo nhanh 15 ứng dụng chuẩn"
          >
            <Sparkles className="size-3.5 text-amber-400" />
            Thêm 15 app mặc định
          </button>
        </div>
      </div>

      {statusMsg.type === "success" && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}
      {statusMsg.type === "error" && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-700/60 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Group 1: Grid Apps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Grid className="size-3.5 text-zinc-400" />
            Lưới ứng dụng Màn hình chính ({gridApps.length} apps)
          </h3>
          <span className="text-[11px] text-zinc-500">
            Hiển thị tối đa 4 cột x 4 hàng (16 icon)
          </span>
        </div>

        <div className="space-y-2">
          {gridApps.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl text-xs">
              Chưa có ứng dụng nào trên màn hình chính. Bấm "Thêm 15 app mặc
              định" hoặc thêm app thủ công bên dưới.
            </div>
          ) : (
            gridApps.map((app, idx) => renderAppRow(app, idx, false))
          )}
        </div>
      </div>

      {/* Group 2: Dock Apps */}
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Layers className="size-3.5 text-purple-400" />
            Thanh Dock cố định dưới cùng ({dockApps.length} apps)
          </h3>
          <span className="text-[11px] text-zinc-500">
            Chuẩn iOS: 4 ứng dụng (Điện thoại, Tin nhắn, Danh bạ, Safari)
          </span>
        </div>

        <div className="space-y-2">
          {dockApps.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl text-xs">
              Chưa có ứng dụng nào trên Dock.
            </div>
          ) : (
            dockApps.map((app, idx) => renderAppRow(app, idx, true))
          )}
        </div>
      </div>

      {/* Add New App Toolbar */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-300">
          Thêm ứng dụng vào màn hình
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={newAppType}
            onChange={(e) => setNewAppType(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
          >
            {KNOWN_APP_TYPES.map((k) => (
              <option key={k.type} value={k.type}>
                {k.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tên hiển thị (tùy chọn)"
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            className="flex-1 min-w-[200px] px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
          />

          <label className="flex items-center gap-1.5 text-xs text-zinc-300 px-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newIsDock}
              onChange={(e) => setNewIsDock(e.target.checked)}
              className="accent-purple-500 rounded"
            />
            Đặt lên Dock
          </label>

          <button
            type="button"
            onClick={handleAddApp}
            disabled={isPending}
            className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Plus className="size-3.5" /> Thêm ứng dụng
          </button>
        </div>
      </div>
    </div>
  );
}
