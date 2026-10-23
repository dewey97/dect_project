"use client";

import React, { useState, useTransition } from "react";
import {
  Smartphone,
  Save,
  Upload,
  Clock,
  Battery,
  Wifi,
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import type { CaseCharacterDevice } from "@/lib/types/database";
import {
  updateDeviceProfile,
  uploadPhoneAsset,
} from "@/lib/actions/phone-actions";

interface DeviceFormProps {
  caseId: string;
  initialDevice: CaseCharacterDevice;
  onDeviceChange: (updated: CaseCharacterDevice) => void;
}

export function DeviceForm({
  caseId,
  initialDevice,
  onDeviceChange,
}: DeviceFormProps) {
  const [device, setDevice] = useState<CaseCharacterDevice>(initialDevice);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [customKey, setCustomKey] = useState("");
  const [customVal, setCustomVal] = useState("");

  const handleChange = (field: keyof CaseCharacterDevice, value: unknown) => {
    const updated = { ...device, [field]: value };
    setDevice(updated);
    onDeviceChange(updated);
  };

  const handleStatusBarChange = (
    subField: "time" | "battery" | "service_text",
    value: unknown,
  ) => {
    const updated = {
      ...device,
      status_bar: {
        ...(device.status_bar || {}),
        [subField]: value,
      },
    };
    setDevice(updated);
    onDeviceChange(updated);
  };

  const handleLockScreenChange = (subField: "time" | "date", value: string) => {
    const updated = {
      ...device,
      lock_screen: {
        ...(device.lock_screen || {}),
        [subField]: value,
      },
    };
    setDevice(updated);
    onDeviceChange(updated);
  };

  const handleSettingsChange = (key: string, value: string) => {
    const updated = {
      ...device,
      settings_info: {
        ...(device.settings_info || {}),
        [key]: value,
      },
    };
    setDevice(updated);
    onDeviceChange(updated);
  };

  const handleRemoveSetting = (key: string) => {
    const current = { ...(device.settings_info || {}) };
    delete current[key];
    const updated = { ...device, settings_info: current };
    setDevice(updated);
    onDeviceChange(updated);
  };

  const handleAddCustomSetting = () => {
    if (!customKey.trim()) return;
    const key = customKey.trim().toLowerCase().replace(/\s+/g, "_");
    handleSettingsChange(key, customVal);
    setCustomKey("");
    setCustomVal("");
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "wallpaper_url" | "selfie_url",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "folder",
        field === "wallpaper_url" ? "wallpapers" : "photos",
      );
      formData.append("caseSlug", caseId);

      const res = await uploadPhoneAsset(formData);
      if (res.success && res.data?.url) {
        handleChange(field, res.data.url);
      } else {
        alert(res.error || "Không thể tải lên ảnh.");
      }
    } catch (err: unknown) {
      alert(
        "Lỗi upload: " + (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      setSaveStatus({ type: "idle" });
      const res = await updateDeviceProfile(caseId, device);
      if (res.success) {
        setSaveStatus({
          type: "success",
          message: "Đã lưu thông tin thiết bị thành công!",
        });
        setTimeout(() => setSaveStatus({ type: "idle" }), 4000);
      } else {
        setSaveStatus({
          type: "error",
          message: res.error || "Không thể lưu thiết bị.",
        });
      }
    });
  };

  const settingsInfo = device.settings_info || {};

  return (
    <div className="space-y-6 text-sm">
      {/* Header & Save Action */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Smartphone className="size-4 text-sky-400" />
            Cấu hình Thiết bị & Hệ điều hành
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Thiết lập ngoại quan, khung vỏ máy (chassis), hình nền và thông số
            hệ thống
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-medium text-xs transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <Save className="size-3.5" />
          {isPending ? "Đang lưu..." : "Lưu thiết bị"}
        </button>
      </div>

      {saveStatus.type === "success" && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>{saveStatus.message}</span>
        </div>
      )}
      {saveStatus.type === "error" && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-700/60 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Section 1: Chassis & Model */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Smartphone className="size-3.5 text-zinc-400" />
          Kiểu dáng vỏ máy (Chassis) & Định danh
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Khung viền máy (Chassis)
            </label>
            <select
              value={device.chassis || "iphone_classic"}
              onChange={(e) =>
                handleChange(
                  "chassis",
                  e.target.value as
                    "iphone_classic" | "iphone_modern" | "android_vintage",
                )
              }
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            >
              <option value="iphone_classic">
                iPhone Classic (Touch ID, màn hình 16:9, viền trên/dưới)
              </option>
              <option value="iphone_modern">
                iPhone Modern (Màn hình tràn viền, Dynamic Island, Home Bar)
              </option>
              <option value="android_vintage">
                Android Vintage (Phím điều hướng cổ điển)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Tên nhãn máy (Label)
            </label>
            <input
              type="text"
              value={device.label || ""}
              onChange={(e) => handleChange("label", e.target.value)}
              placeholder="VD: iPhone 6s Plus (64GB, Space Gray)"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Mô tả vật chứng / Tình trạng thu giữ
          </label>
          <textarea
            rows={2}
            value={device.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="VD: Thu giữ trong túi áo nạn nhân tại hiện trường, màn hình rạn nhẹ góc trên..."
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500 resize-none"
          />
        </div>
      </div>

      {/* Section 2: Wallpaper & Media */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <ImageIcon className="size-3.5 text-zinc-400" />
          Hình nền & Camera Easter Egg
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Hình nền màn hình chính (Wallpaper URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={device.wallpaper_url || ""}
                onChange={(e) => handleChange("wallpaper_url", e.target.value)}
                placeholder="/images/cases/... hoặc URL ảnh"
                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
              />
              <label className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer flex items-center gap-1 text-xs shrink-0">
                <Upload className="size-3.5" />
                {uploadingField === "wallpaper_url" ? "Đang tải..." : "Tải ảnh"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "wallpaper_url")}
                />
              </label>
            </div>
            {device.wallpaper_url && (
              <div className="mt-2 w-20 h-32 rounded-lg overflow-hidden border border-zinc-700 bg-black">
                <img
                  src={device.wallpaper_url}
                  alt="Wallpaper preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Selfie Camera Easter Egg (Ảnh bất ngờ khi chụp)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={device.selfie_url || ""}
                onChange={(e) => handleChange("selfie_url", e.target.value)}
                placeholder="/images/cases/... hoặc URL ảnh"
                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
              />
              <label className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer flex items-center gap-1 text-xs shrink-0">
                <Upload className="size-3.5" />
                {uploadingField === "selfie_url" ? "Đang tải..." : "Tải ảnh"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "selfie_url")}
                />
              </label>
            </div>
            {device.selfie_url && (
              <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-zinc-700 bg-black">
                <img
                  src={device.selfie_url}
                  alt="Selfie preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Status Bar & Lock Screen */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Clock className="size-3.5 text-zinc-400" />
          Màn hình khóa & Thanh trạng thái (Status Bar)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1">
              <Clock className="size-3 text-zinc-400" />
              Thời gian đóng băng
            </label>
            <input
              type="text"
              value={device.status_bar?.time || "21:30"}
              onChange={(e) => handleStatusBarChange("time", e.target.value)}
              placeholder="21:30"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1">
              <Battery className="size-3 text-zinc-400" />
              Phần trăm pin (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={100}
                value={device.status_bar?.battery ?? 15}
                onChange={(e) =>
                  handleStatusBarChange("battery", Number(e.target.value))
                }
                className="w-20 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
              />
              <input
                type="range"
                min={1}
                max={100}
                value={device.status_bar?.battery ?? 15}
                onChange={(e) =>
                  handleStatusBarChange("battery", Number(e.target.value))
                }
                className="flex-1 accent-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1">
              <Wifi className="size-3 text-zinc-400" />
              Tên nhà mạng / Trạng thái
            </label>
            <input
              type="text"
              value={device.status_bar?.service_text || "Không có Dịch vụ"}
              onChange={(e) =>
                handleStatusBarChange("service_text", e.target.value)
              }
              placeholder="VD: Viettel, Không có Dịch vụ..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Ngày tháng hiển thị màn hình khóa
            </label>
            <input
              type="text"
              value={device.lock_screen?.date || "Thứ Bảy, 23 tháng 7"}
              onChange={(e) => handleLockScreenChange("date", e.target.value)}
              placeholder="Thứ Bảy, 23 tháng 7"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1">
              <Shield className="size-3 text-zinc-400" />
              Mã PIN mở khóa (Passcode)
            </label>
            <input
              type="text"
              value={device.passcode || ""}
              onChange={(e) => handleChange("passcode", e.target.value)}
              placeholder="VD: 120713 (để trống nếu không khóa số)"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Settings Info Key-Values */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Shield className="size-3.5 text-zinc-400" />
          Thông tin chi tiết trong ứng dụng Cài đặt (Settings App)
        </h3>

        <div className="space-y-2">
          {Object.entries(settingsInfo).map(([key, val]) => (
            <div
              key={key}
              className="flex items-center gap-2 bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/80"
            >
              <span className="w-32 text-xs font-mono text-zinc-400 truncate capitalize">
                {key.replace(/_/g, " ")}:
              </span>
              <input
                type="text"
                value={String(val)}
                onChange={(e) => handleSettingsChange(key, e.target.value)}
                className="flex-1 px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveSetting(key)}
                className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                title="Xóa trường này"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom setting field */}
        <div className="flex gap-2 pt-2 border-t border-zinc-800/80">
          <input
            type="text"
            placeholder="Tên trường (vd: imei, sim_operator)..."
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            className="w-44 px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
          />
          <input
            type="text"
            placeholder="Giá trị hiển thị..."
            value={customVal}
            onChange={(e) => setCustomVal(e.target.value)}
            className="flex-1 px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={handleAddCustomSetting}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <Plus className="size-3.5" /> Thêm trường
          </button>
        </div>
      </div>
    </div>
  );
}
