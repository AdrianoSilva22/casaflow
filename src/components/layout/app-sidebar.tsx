"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMMITMENT_ITEMS, MORE_ITEMS, NAV_ITEMS } from "@/constants/navigation";
import { PRODUCT_NAME } from "@/constants/product";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar p-5 lg:flex lg:flex-col">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
        <span className="grid size-11 place-items-center rounded-2xl bg-primary text-lg font-bold text-white">
          C
        </span>
        <div>
          <p className="text-lg font-semibold">{PRODUCT_NAME}</p>
          <p className="text-xs text-muted-foreground">Finanças do casal</p>
        </div>
      </Link>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <p className="mt-6 px-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Compromissos</p>
      <nav className="space-y-1">
        {COMMITMENT_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium",
                active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/financas/nova"
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-white"
      >
        <Plus className="size-4" />
        Nova finança
      </Link>

      <div className="mt-auto space-y-1 pt-6">
        {MORE_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium",
                active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="pt-3">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
