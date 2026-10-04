"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { CalendarView } from "@/features/calendar/calendar-view";
import { QueryState } from "@/components/ui/query-state";
import { fetchCalendar } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function CalendarPageView() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["calendar"],
    queryFn: () => fetchCalendar("2024-10-01", "2026-09-30"),
  });

  return (
    <div className="space-y-5">
      <DashboardHeader title="Calendário" subtitle="Vencimentos no ritmo da casa" />
      <QueryState
        isLoading={isLoading}
        isError={isError || (!isLoading && !data)}
        onRetry={() => void refetch()}
        loading={<Skeleton className="h-[480px]" />}
      >
        {data ? <CalendarView entries={data.items} /> : null}
      </QueryState>
    </div>
  );
}
