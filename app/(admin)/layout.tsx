import React from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/toast";
import { requireAdminAuth } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudioCaseId } from "@/lib/studio/active-case";

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

  // Case list for the sidebar picker. Plain query: admin was checked above, and
  // another requireAdminAuth here would add one more token refresh per request.
  const supabase = await createClient();
  const [{ data: caseRows }, savedCaseId] = await Promise.all([
    supabase.from("cases").select("slug, title").order("created_at", { ascending: false }),
    getStudioCaseId(),
  ]);
  const cases = (caseRows ?? []).map((c) => ({ slug: c.slug, title: c.title }));

  return (
    <>
      <AdminShell cases={cases} savedCaseId={savedCaseId}>
        {children}
      </AdminShell>
      <Toaster />
    </>
  );
}
