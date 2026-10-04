"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { adriano, adrielle } from "@/mocks/family";

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 mb-6 flex items-center justify-between gap-3 border-b border-border/70 bg-background/80 px-1 py-4 backdrop-blur">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">CasaFlow</p>
        <h1 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-pretty text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link href="/financas" className="grid size-11 place-items-center rounded-2xl border border-border bg-card">
          <Search className="size-4" />
        </Link>
        <button type="button" className="relative grid size-11 place-items-center rounded-2xl border border-border bg-card">
          <Bell className="size-4" />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-danger" />
        </button>
        <div className="hidden sm:block">
          <ThemeToggle compact />
        </div>
        <Link href="/perfil" className="flex -space-x-2">
          <Avatar initials={adriano.avatarInitials} color={adriano.color} size="sm" />
          <Avatar initials={adrielle.avatarInitials} color={adrielle.color} size="sm" />
        </Link>
      </div>
    </header>
  );
}
