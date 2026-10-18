import React from "react";
import { AdminShell } from "@/components/admin/admin-shell";
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
    <>
      <AdminShell>{children}</AdminShell>
      <Toaster />
    </>
  );
}
