"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, UserCircle, Terminal, Palette } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { emitInvestigationEvent } from "@/lib/investigation-events";
import { cn } from "@/lib/utils";

interface UserNavProps {
  size?: "sm" | "md";
}

export function UserNav({ size = "md" }: UserNavProps) {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

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

  // Xử lý click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          "animate-pulse bg-muted rounded-full",
          isSmall ? "size-7.5" : "size-9"
        )}
      />
    );
  }

  if (user) {
    const firstLetter = user.email?.charAt(0).toUpperCase() || "U";
    const isSuperAdmin = user.app_metadata?.role === "super_admin";

    return (
      <div className="relative" ref={dropdownRef} data-user-nav="true">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
            isSmall ? "size-7.5 text-xs" : "size-9 text-sm"
          )}
          title="Tài khoản của bạn"
        >
          {firstLetter}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-popover text-popover-foreground rounded-xl shadow-lg border border-border/60 p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-border/60 mb-1 flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-xs text-muted-foreground">
                  Đã đăng nhập bằng
                </p>
                <p className="text-sm font-medium truncate" title={user.email}>
                  {user.email}
                </p>
              </div>
              {isAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive text-destructive-foreground ml-2">
                  ADMIN
                </span>
              )}
            </div>

            <div className="p-1 flex flex-col gap-1">
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/studio");
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors text-left font-medium border border-indigo-500/20 mb-1 cursor-pointer"
                  >
                    <Terminal className="w-4 h-4" />
                    Creator Studio
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      emitInvestigationEvent("OPEN_CANVAS_THEME");
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors text-left font-medium border border-amber-500/20 mb-1 cursor-pointer"
                  >
                    <Palette className="w-4 h-4 text-amber-500" />
                    Màu bàn hồ sơ (Canvas)
                  </button>
                </>
              )}
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-not-allowed opacity-50">
                <UserCircle className="w-4 h-4" />
                Hồ sơ cá nhân
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-not-allowed opacity-50">
                <Settings className="w-4 h-4" />
                Cài đặt
              </button>
            </div>

            <div className="border-t border-border/60 mt-1 p-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-left text-destructive font-medium"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push("/login")}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground rounded-full transition-colors cursor-pointer flex items-center justify-center",
        isSmall ? "p-1.5" : "p-2"
      )}
      title="Đăng nhập"
    >
      <User className={isSmall ? "size-4" : "size-5"} />
    </button>
  );
}
