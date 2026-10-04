import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  color,
  size = "md",
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-14 text-lg",
      )}
      style={{ background: color }}
    >
      {initials}
    </span>
  );
}
