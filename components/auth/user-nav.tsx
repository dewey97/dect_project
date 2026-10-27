"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, UserCircle, Terminal, Palette, LogIn } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { emitInvestigationEvent } from "@/lib/investigation-events";
import { cn } from "@/lib/utils";

interface UserNavProps {
  size?: "sm" | "md";
  placement?: "default" | "sidebar";
}

export function UserNav({ size = "md", placement = "default" }: UserNavProps) {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        if (currentUser.app_metadata?.role === "super_admin") {
          setIsAdmin(true);
        } else {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single();
          setIsAdmin(profile?.role === "admin" || !profile);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Xử lý click ra ngoài để đóng menu (hỗ trợ cả Portal)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      if (placement === "sidebar") {
        setDropdownPos({
          left: rect.right + 10,
          bottom: Math.max(12, window.innerHeight - rect.bottom),
        });
      } else {
        setDropdownPos({
          right: Math.max(12, window.innerWidth - rect.right),
          top: rect.bottom + 8,
        });
      }
    }
    setIsOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
  };

  const isSmall = size === "sm";

  if (loading) {
    return (
      <div
        className={cn(
          "animate-pulse bg-muted rounded-full shrink-0",
          isSmall ? "size-7.5" : "size-9"
        )}
      />
    );
  }

  const firstLetter = user?.email?.charAt(0).toUpperCase() || "T";

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-center rounded-full font-semibold shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer shrink-0 select-none",
          user
            ? "bg-primary text-primary-foreground"
            : "bg-zinc-800 text-zinc-300 border border-zinc-700/80 hover:bg-zinc-700",
          isSmall ? "size-7.5 text-xs" : "size-9 text-sm"
        )}
        title={user ? `Tài khoản: ${user.email}` : "Hồ sơ thám tử & Tùy chọn"}
        data-user-nav="true"
      >
        {user ? (
          firstLetter
        ) : (
          <User className={isSmall ? "size-3.5" : "size-4"} />
        )}
      </button>

      {/* PORTAL DROPDOWN: Render trực tiếp vào document.body để không bao giờ bị overflow-hidden hay backdrop-filter của sidebar chặn/cắt */}
      {isOpen && isMounted && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            data-user-nav="true"
            style={{
              position: "fixed",
              left: dropdownPos?.left,
              right: dropdownPos?.right,
              top: dropdownPos?.top,
              bottom: dropdownPos?.bottom,
              zIndex: 9999,
            }}
            className="w-56 bg-[#16181e]/98 text-zinc-100 rounded-xl shadow-2xl border border-zinc-700/80 p-1 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {/* Header: Thông tin tài khoản hoặc trạng thái khách */}
            <div className="px-3 py-2 border-b border-zinc-800/80 mb-1 flex items-center justify-between">
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-[11px] text-zinc-400">
                  {user ? "Đã đăng nhập bằng" : "Trạng thái người chơi"}
                </p>
                <p className="text-xs font-semibold truncate text-zinc-200" title={user?.email || "Thám tử khách"}>
                  {user ? user.email : "Thám tử khách"}
                </p>
              </div>
              {isAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive text-destructive-foreground ml-2 shrink-0">
                  ADMIN
                </span>
              )}
            </div>

            <div className="p-1 flex flex-col gap-1">
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/studio");
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-left font-medium border border-indigo-500/20 mb-0.5 cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  Creator Studio
                </button>
              )}

              {/* TÙY CHỌN MÀU BÀN HỒ SƠ (Khả dụng cho tất cả người chơi) */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => emitInvestigationEvent("OPEN_CANVAS_THEME"), 50);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors text-left font-medium border border-amber-500/20 mb-0.5 cursor-pointer"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                Màu bàn hồ sơ (Canvas)
              </button>

              {user ? (
                <>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors text-left cursor-not-allowed opacity-50">
                    <UserCircle className="w-4 h-4" />
                    Hồ sơ cá nhân
                  </button>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors text-left cursor-not-allowed opacity-50">
                    <Settings className="w-4 h-4" />
                    Cài đặt
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-left font-medium cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập tài khoản
                </button>
              )}
            </div>

            {user && (
              <div className="border-t border-zinc-800/80 mt-1 p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-destructive/15 hover:text-destructive transition-colors text-left text-destructive font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
