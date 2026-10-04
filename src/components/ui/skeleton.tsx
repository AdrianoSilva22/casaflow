import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-muted", className)} />;
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
    >
      <span
        className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-primary" : "bg-input"}`}
      >
        <span
          className={`absolute top-1 left-1 size-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </span>
      {label ? <span className="text-sm font-medium">{label}</span> : null}
    </button>
  );
}
