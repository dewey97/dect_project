"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface WaitlistFormProps {
  source?: "hero" | "dispatch_banner" | "footer" | "cases";
  variant?: "inline" | "card" | "compact";
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
}

const REQUEST_TIMEOUT_MS = 12_000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function WaitlistForm({
  source = "hero",
  variant = "inline",
  placeholder = "Nhập email thám tử của bạn...",
  buttonLabel = "Nhận Hồ Sơ Mật",
  className = "",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setStatus("error");
      setErrorMessage("Vui lòng nhập định dạng email hợp lệ (ví dụ: detective@xplore.vn).");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, source }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success !== true) {
        throw new Error(data?.error || "Gửi yêu cầu không thành công.");
      }

      setStatus("success");
      trackEvent("waitlist_signup", {
        source,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setStatus("error");
      if (err.name === "AbortError") {
        setErrorMessage("Thời gian phản hồi quá lâu. Vui lòng kiểm tra kết nối mạng và thử lại.");
      } else {
        setErrorMessage(err.message || "Có lỗi kết nối. Vui lòng thử lại sau.");
      }
    } finally {
      clearTimeout(timer);
    }
  }

  if (status === "success") {
    return (
      <div
        className={`flex items-center gap-3 p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs sm:text-sm font-mono backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-in fade-in duration-300 ${className}`}
      >
        <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
        <div>
          <span className="font-bold text-emerald-200">ĐÃ NIÊM PHONG HỒ SƠ!</span>
          <p className="text-[0.75rem] text-emerald-300/80 mt-0.5">
            Bạn sẽ nhận được mật mã điều tra sớm & thông báo phát hành qua email <strong className="text-emerald-100">{email}</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col gap-2 w-full ${className}`} noValidate>
        <div className="relative flex items-center">
          <Mail className="absolute left-3 size-4 text-muted-foreground/60 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={placeholder}
            disabled={status === "submitting"}
            className="w-full h-10 pl-9 pr-24 rounded-md border border-border/40 bg-zinc-950/80 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="absolute right-1 h-8 px-3 rounded bg-primary/90 hover:bg-primary text-primary-foreground font-mono text-[0.7rem] font-bold tracking-wider uppercase transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
          >
            {status === "submitting" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <span>Gửi</span>
            )}
          </button>
        </div>
        {status === "error" && (
          <p className="text-[0.7rem] text-destructive flex items-center gap-1 font-mono">
            <AlertCircle className="size-3 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}
      </form>
    );
  }

  if (variant === "card") {
    return (
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-xl p-5 sm:p-6 rounded-xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/80 flex flex-col gap-4 relative overflow-hidden ${className}`}
        noValidate
      >
        {/* Subtle decorative top tape */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20" />

        <div className="flex flex-col gap-1.5 text-left">
          <div className="inline-flex items-center gap-2 text-[0.7rem] font-mono tracking-widest uppercase text-amber-400 font-bold">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            ĐẶT TRƯỚC HỒ SƠ CHUYÊN ÁN (WAITLIST)
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-100 uppercase font-sans">
            Gia Nhập Lực Lượng Điều Tra Đặc Nhiệm
          </h3>
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            Để lại email để nhận thông báo sớm khi mở bản in Board Game vật lý và nhận gợi ý giải đố ẩn độc quyền.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder={placeholder}
              disabled={status === "submitting"}
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-zinc-700/60 bg-zinc-950/90 text-sm font-mono text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="h-12 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>ĐANG XỬ LÝ...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>{buttonLabel}</span>
              </>
            )}
          </button>
        </div>

        {status === "error" && (
          <p className="text-xs text-rose-400 flex items-center gap-1.5 font-mono text-left">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}

        <div className="text-[0.65rem] text-zinc-500 font-mono text-left flex items-center gap-1.5">
          <span>🔒 Bảo mật 100%. Không thư rác. Hủy đăng ký bất kỳ lúc nào chỉ bằng một cú nhấp.</span>
        </div>
      </form>
    );
  }

  // Default "inline" variant for Hero Section
  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-md flex flex-col gap-2 ${className}`} noValidate>
      <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full">
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={placeholder}
            disabled={status === "submitting"}
            className="w-full h-11 pl-10 pr-3 rounded-md border border-border/40 bg-zinc-950/80 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="h-11 px-5 rounded-md bg-amber-500/90 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-black uppercase tracking-wider shadow-md hover:shadow-amber-500/30 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
        >
          {status === "submitting" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <>
              <Mail className="size-3.5" />
              <span>{buttonLabel}</span>
            </>
          )}
        </button>
      </div>

      {status === "error" && (
        <p className="text-[0.7rem] text-destructive flex items-center gap-1 font-mono text-left">
          <AlertCircle className="size-3 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}
    </form>
  );
}
