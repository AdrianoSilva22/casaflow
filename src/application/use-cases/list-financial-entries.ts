import { withResolvedStatus } from "@/domain/services/entry-status";
import type {
  FinancialEntryRepository,
  ListFinancialEntriesInput,
  PaginatedEntries,
} from "@/application/ports/financial-entry.repository";

export async function listFinancialEntries(
  repository: FinancialEntryRepository,
  input: ListFinancialEntriesInput = {},
): Promise<PaginatedEntries> {
  const {
    filters = {},
    sort = "dueDate",
    direction = "desc",
    page = 1,
    pageSize = 10,
  } = input;

  let items = (await repository.list()).map((entry) => withResolvedStatus(entry));

  if (filters.search) {
    const term = filters.search.toLowerCase();
    items = items.filter((entry) =>
      [entry.name, entry.description, entry.notes].some((value) => value.toLowerCase().includes(term)),
    );
  }

  if (filters.category && filters.category !== "all") {
    items = items.filter((entry) => entry.category === filters.category);
  }
  if (filters.status && filters.status !== "all") {
    items = items.filter((entry) => entry.status === filters.status);
  }
  if (filters.responsible && filters.responsible !== "all") {
    items = items.filter((entry) => entry.responsible === filters.responsible);
  }
  if (filters.type && filters.type !== "all") {
    items = items.filter((entry) => entry.type === filters.type);
  }
  if (filters.commitmentKind && filters.commitmentKind !== "all") {
    items = items.filter((entry) => entry.commitmentKind === filters.commitmentKind);
  }
  if (filters.from) {
    items = items.filter((entry) => entry.dueDate >= filters.from!);
  }
  if (filters.to) {
    items = items.filter((entry) => entry.dueDate <= filters.to!);
  }

  items.sort((a, b) => {
    const modifier = direction === "asc" ? 1 : -1;
    if (sort === "amount") return (a.amount - b.amount) * modifier;
    if (sort === "name") return a.name.localeCompare(b.name, "pt-BR") * modifier;
    if (sort === "status") return a.status.localeCompare(b.status) * modifier;
    return a.dueDate.localeCompare(b.dueDate) * modifier;
  });

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    pageCount,
  };
}
