"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { FinancialEntryFilters, FinancialEntrySort, SortDirection } from "@/application/ports/financial-entry.repository";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  ENTRY_STATUSES,
  ENTRY_STATUS_LABELS,
  ENTRY_TYPE_LABELS,
  ENTRY_TYPES,
  RESPONSIBLE_LABELS,
  RESPONSIBLES,
} from "@/domain/value-objects/enums";
import { COMMITMENT_KIND_LABELS, COMMITMENT_KINDS } from "@/domain/value-objects/commitments";

export interface FilterState extends FinancialEntryFilters {
  sort: FinancialEntrySort;
  direction: SortDirection;
}

export function FinancialFilters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (value: FilterState) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por nome, descrição..."
          value={value.search ?? ""}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
        />
        <Button type="button" variant="outline" className="shrink-0" onClick={() => setOpen((current) => !current)}>
          <SlidersHorizontal className="size-4" />
          Filtros
        </Button>
      </div>
      {open ? (
        <div className="grid gap-3 rounded-3xl border border-border bg-card p-4 md:grid-cols-3">
          <Select value={value.category ?? "all"} onChange={(event) => onChange({ ...value, category: event.target.value as FilterState["category"] })}>
            <option value="all">Todas as categorias</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {CATEGORY_LABELS[item]}
              </option>
            ))}
          </Select>
          <Select value={value.status ?? "all"} onChange={(event) => onChange({ ...value, status: event.target.value as FilterState["status"] })}>
            <option value="all">Todos os status</option>
            {ENTRY_STATUSES.map((item) => (
              <option key={item} value={item}>
                {ENTRY_STATUS_LABELS[item]}
              </option>
            ))}
          </Select>
          <Select value={value.responsible ?? "all"} onChange={(event) => onChange({ ...value, responsible: event.target.value as FilterState["responsible"] })}>
            <option value="all">Todos os responsáveis</option>
            {RESPONSIBLES.map((item) => (
              <option key={item} value={item}>
                {RESPONSIBLE_LABELS[item]}
              </option>
            ))}
          </Select>
          <Select
            value={value.commitmentKind ?? "all"}
            onChange={(event) => onChange({ ...value, commitmentKind: event.target.value as FilterState["commitmentKind"] })}
          >
            <option value="all">Única, recorrente e parcela</option>
            {COMMITMENT_KINDS.map((item) => (
              <option key={item} value={item}>
                {COMMITMENT_KIND_LABELS[item]}
              </option>
            ))}
          </Select>
          <Select value={value.type ?? "all"} onChange={(event) => onChange({ ...value, type: event.target.value as FilterState["type"] })}>
            <option value="all">Todos os tipos</option>
            {ENTRY_TYPES.map((item) => (
              <option key={item} value={item}>
                {ENTRY_TYPE_LABELS[item]}
              </option>
            ))}
          </Select>
          <Input type="date" value={value.from ?? ""} onChange={(event) => onChange({ ...value, from: event.target.value })} />
          <Input type="date" value={value.to ?? ""} onChange={(event) => onChange({ ...value, to: event.target.value })} />
          <Select value={value.sort} onChange={(event) => onChange({ ...value, sort: event.target.value as FinancialEntrySort })}>
            <option value="dueDate">Ordenar por data</option>
            <option value="amount">Ordenar por valor</option>
            <option value="name">Ordenar por nome</option>
            <option value="status">Ordenar por status</option>
          </Select>
          <Select value={value.direction} onChange={(event) => onChange({ ...value, direction: event.target.value as SortDirection })}>
            <option value="desc">Maior / mais recente</option>
            <option value="asc">Menor / mais antigo</option>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
