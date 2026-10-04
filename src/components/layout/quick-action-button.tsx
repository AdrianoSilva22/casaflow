import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QuickActionButton({ className }: { className?: string }) {
  return (
    <Link
      href="/financas/nova"
      aria-label="Nova finança"
      className={cn(
        "grid size-14 place-items-center rounded-full bg-primary text-white shadow-xl shadow-primary/30",
        className,
      )}
    >
      <Plus className="size-6" />
    </Link>
  );
}
