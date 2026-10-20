"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Map / Dossier / Checkpoint Studio require edge-to-edge canvas without default p-8 padding
  const isFullBleedStudio =
    pathname.startsWith("/studio/map") ||
    pathname.startsWith("/studio/dossier") ||
    pathname.startsWith("/studio/checkpoints");

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0d] text-zinc-100 selection:bg-primary/30 font-sans overflow-hidden">
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <main
          className={cn(
            "flex-1 relative z-10 min-w-0 min-h-0",
            isFullBleedStudio
              ? "h-full w-full overflow-hidden flex flex-col p-0"
              : "overflow-auto p-8",
          )}
        >
          {children}
        </main>

        {/* Subtle background glow effect - only for standard dashboards */}
        {!isFullBleedStudio && (
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />
        )}
      </div>
    </div>
  );
}
