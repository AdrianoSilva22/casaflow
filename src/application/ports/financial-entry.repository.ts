import type { FinancialEntry, FinancialEntryDraft } from "@/domain/entities/financial-entry";
import type { Category, EntryStatus, EntryType, Responsible } from "@/domain/value-objects/enums";
import type { CommitmentKind } from "@/domain/value-objects/commitments";

export interface FinancialEntryFilters {
  search?: string;
  category?: Category | "all";
  status?: EntryStatus | "all";
  responsible?: Responsible | "all";
  type?: EntryType | "all";
  commitmentKind?: CommitmentKind | "all";
  from?: string;
  to?: string;
}

export type FinancialEntrySort = "amount" | "dueDate" | "name" | "status";
export type SortDirection = "asc" | "desc";

export interface ListFinancialEntriesInput {
  filters?: FinancialEntryFilters;
  sort?: FinancialEntrySort;
  direction?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface PaginatedEntries {
  items: FinancialEntry[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface FinancialEntryRepository {
  list(): Promise<FinancialEntry[]>;
  findById(id: string): Promise<FinancialEntry | null>;
  create(input: FinancialEntryDraft): Promise<FinancialEntry>;
  update(id: string, input: Partial<FinancialEntryDraft>): Promise<FinancialEntry>;
  remove(id: string): Promise<void>;
}
