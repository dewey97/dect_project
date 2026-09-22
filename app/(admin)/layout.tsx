import React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/toast";
import { requireAdminAuth } from "@/lib/actions/auth-guard";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdminAuth();
  } catch (error) {
    redirect("/login?redirect=/studio");
  }

  return (
    <div className="flex h-screen bg-[#0a0a0d] text-zinc-100 selection:bg-primary/30 font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <main className="flex-1 overflow-auto p-8 relative z-10">
          {children}
        </main>

        {/* Subtle background glow effect */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />
      </div>
      <Toaster />
    </div>
  );
}
