"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { readRoomSessions } from "@/lib/rooms/client";
import { normalizeCaseId } from "@/lib/cases/case-id";

/**
 * Client half of the play gate (see serverAllowsPlay).
 * `allowed` comes from the server. When it is false, a device that holds a
 * room session of this case (an invited player, no purchase needed) still
 * gets in; anyone else is sent to the case page.
 * Before the check runs, a status line renders instead of an empty screen.
 */
export function CaseAccessGuard({
  caseId,
  allowed,
  children,
}: {
  caseId: string;
  allowed: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [inRoom, setInRoom] = useState(false);

  useEffect(() => {
    if (allowed) return;
    const hasSession = readRoomSessions().some(
      (s) => normalizeCaseId(s.caseId) === caseId,
    );
    if (hasSession) setInRoom(true);
    else router.replace(`/cases/${caseId}`);
  }, [allowed, caseId, router]);

  if (allowed || inRoom) return <>{children}</>;
  return (
    <div className="flex h-full min-h-dvh w-full items-center justify-center bg-[#0d0c0a] px-4">
      <p role="status" className="text-center text-sm text-zinc-400">
        Đang kiểm tra quyền chơi…
      </p>
    </div>
  );
}
