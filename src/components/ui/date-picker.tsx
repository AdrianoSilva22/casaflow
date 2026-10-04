"use client";

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Selecionar data" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T12:00:00`) : undefined;
  const [cursor, setCursor] = useState(selected ?? new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div className="relative">
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          readOnly
          value={value ? format(new Date(`${value}T12:00:00`), "dd/MM/yyyy") : ""}
          placeholder={placeholder}
          className="pl-11"
          onClick={() => setOpen((current) => !current)}
        />
      </div>
      {open ? (
        <div className="absolute z-30 mt-2 w-full rounded-3xl border border-border bg-card p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="size-9" type="button" onClick={() => setCursor(addMonths(cursor, -1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-sm font-semibold capitalize">{format(cursor, "MMMM yyyy", { locale: ptBR })}</p>
            <Button variant="ghost" size="icon" className="size-9" type="button" onClick={() => setCursor(addMonths(cursor, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const outside = day.getMonth() !== cursor.getMonth();
              const active = value === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={cn(
                    "h-9 rounded-xl text-sm transition-colors",
                    outside && "text-muted-foreground/50",
                    active ? "bg-primary text-white" : "hover:bg-muted",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
