"use client";

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { FinancialEntry } from "@/domain/entities/financial-entry";
import { CATEGORY_LABELS, ENTRY_STATUS_LABELS } from "@/domain/value-objects/enums";
import { formatCurrency } from "@/lib/format";
import { calendarDot } from "@/features/finances/financial-status";
import { resolveDisplayStatus } from "@/domain/services/display-status";
import { REFERENCE_DATE } from "@/constants/reference-date";
import { cn } from "@/lib/utils";

type Mode = "month" | "week" | "day";

export function CalendarView({ entries }: { entries: FinancialEntry[] }) {
  const [cursor, setCursor] = useState(new Date("2026-09-10"));
  const [mode, setMode] = useState<Mode>("month");
  const [filter, setFilter] = useState("all");

  const filtered = entries.filter((entry) => {
    if (filter === "income") return entry.type === "income";
    if (filter === "expense") return entry.type === "expense";
    if (filter === "overdue") return entry.status === "overdue";
    return true;
  });

  const days = useMemo(() => {
    if (mode === "day") return [cursor];
    if (mode === "week") {
      return eachDayOfInterval({
        start: startOfWeek(cursor, { weekStartsOn: 0 }),
        end: endOfWeek(cursor, { weekStartsOn: 0 }),
      });
    }
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 }),
    });
  }, [cursor, mode]);

  const selectedEntries = filtered.filter((entry) => isSameDay(new Date(`${entry.dueDate}T12:00:00`), cursor));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor(mode === "day" ? addDays(cursor, -1) : addMonths(cursor, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <div>
            <p className="text-lg font-semibold capitalize">{format(cursor, mode === "day" ? "dd MMMM yyyy" : "MMMM yyyy", { locale: ptBR })}</p>
            <p className="text-xs text-muted-foreground">Navegação rápida do calendário financeiro</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setCursor(mode === "day" ? addDays(cursor, 1) : addMonths(cursor, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Select value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
            <option value="month">Mês</option>
            <option value="week">Semana</option>
            <option value="day">Dia</option>
          </Select>
          <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">Todos</option>
            <option value="expense">Despesas</option>
            <option value="income">Receitas</option>
            <option value="overdue">Atrasados</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <Legend color="bg-emerald-500" label="Pago" />
        <Legend color="bg-amber-400" label="Próximo vencimento" />
        <Legend color="bg-rose-500" label="Atrasado" />
        <Legend color="bg-sky-500" label="Receita / futuro" />
      </div>

      {mode !== "day" ? (
        <Card className="p-3">
          <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className={cn("grid grid-cols-7 gap-1", mode === "week" && "auto-rows-fr")}>
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayEntries = filtered.filter((entry) => entry.dueDate === key);
              const selected = isSameDay(day, cursor);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCursor(day)}
                  className={cn(
                    "min-h-20 rounded-2xl border border-transparent p-2 text-left transition-colors",
                    selected ? "border-primary bg-primary/10" : "hover:bg-muted",
                    !isSameMonth(day, cursor) && mode === "month" && "opacity-40",
                  )}
                >
                  <p className="text-xs font-semibold">{format(day, "d")}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dayEntries.slice(0, 4).map((entry) => (
                      <span key={entry.id} className={cn("size-2 rounded-full", calendarDot(resolveDisplayStatus(entry, REFERENCE_DATE), entry.type))} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Lançamentos do dia</h3>
        {selectedEntries.length === 0 ? (
          <Card className="text-sm text-muted-foreground">Nada previsto para esta data.</Card>
        ) : (
          selectedEntries.map((entry) => (
            <Card key={entry.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{entry.name}</p>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[entry.category]} · {ENTRY_STATUS_LABELS[entry.status]}
                </p>
              </div>
              <p className="tabular font-semibold">{formatCurrency(entry.amount)}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <span className={cn("size-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}
