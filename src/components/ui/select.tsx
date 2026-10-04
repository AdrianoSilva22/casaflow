import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full appearance-none rounded-2xl border border-input bg-card text-foreground bg-[length:16px] bg-[right_1rem_center] bg-no-repeat px-4 pr-10 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15 [color-scheme:inherit]",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
