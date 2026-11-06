import { CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BadgeOwnership {
  online: boolean;
  box: boolean;
}

export function ownershipLabel(o: BadgeOwnership): string {
  if (o.box && o.online) return "Đã kích hoạt hộp · Đã có bản online";
  if (o.box) return "Đã kích hoạt hộp";
  if (o.online) return "Đã có bản online";
  return "Chưa sở hữu";
}

/** Shared "owned / not owned" pill for the case page, case list and /me. */
export function OwnershipBadge({
  ownership,
  className,
}: {
  ownership: BadgeOwnership;
  className?: string;
}) {
  const owned = ownership.online || ownership.box;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        owned
          ? "border-emerald-800 bg-emerald-950/40 text-emerald-300"
          : "border-zinc-700 bg-zinc-900 text-zinc-300",
        className,
      )}
    >
      {owned ? (
        <CheckCircle2 className="size-3.5" aria-hidden />
      ) : (
        <Lock className="size-3.5" aria-hidden />
      )}
      {ownershipLabel(ownership)}
    </span>
  );
}
