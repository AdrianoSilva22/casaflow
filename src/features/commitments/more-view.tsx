import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { COMMITMENT_ITEMS } from "@/constants/navigation";

export function MoreView() {
  return (
    <div className="space-y-5">
      <DashboardHeader title="Mais" subtitle="Parcelamentos, recorrentes, resumo e histórico" />
      <div className="grid gap-3">
        {COMMITMENT_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <p className="font-semibold">{item.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
