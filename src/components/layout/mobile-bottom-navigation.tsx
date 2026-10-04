"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QuickActionButton } from "@/components/layout/quick-action-button";
import { NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const left = NAV_ITEMS.slice(0, 2);
  const right = NAV_ITEMS.slice(2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 items-center">
        {left.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname.startsWith(item.href)} />
        ))}
        <QuickActionButton className="-mt-7 mx-auto" />
        {right.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname.startsWith(item.href)} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link href={href} className={cn("flex flex-col items-center gap-1 py-1 text-[11px]", active ? "text-primary" : "text-muted-foreground")}>
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
