import { NextResponse } from "next/server";
import { financialEntryRepository } from "@/infrastructure/repositories/prisma-financial-entry.repository";
import { commitmentsRepository } from "@/infrastructure/repositories/prisma-commitments.repository";
import { createCommitment } from "@/application/use-cases/create-commitment";
import { listFinancialEntries } from "@/application/use-cases/list-financial-entries";
import { syncCommitments } from "@/application/use-cases/sync-commitments";
import { financialEntrySchema } from "@/validators/financial-entry.schema";
import type { Category, EntryStatus, EntryType, Responsible } from "@/domain/value-objects/enums";
import type { CommitmentKind } from "@/domain/value-objects/commitments";
import type { FinancialEntrySort, SortDirection } from "@/application/ports/financial-entry.repository";
import { apiError } from "@/lib/api-route";

export async function GET(request: Request) {
  try {
    await syncCommitments(financialEntryRepository, commitmentsRepository, new Date());
    const { searchParams } = new URL(request.url);

    const result = await listFinancialEntries(financialEntryRepository, {
      filters: {
        search: searchParams.get("search") ?? undefined,
        category: (searchParams.get("category") as Category | null) ?? undefined,
        status: (searchParams.get("status") as EntryStatus | null) ?? undefined,
        responsible: (searchParams.get("responsible") as Responsible | null) ?? undefined,
        type: (searchParams.get("type") as EntryType | null) ?? undefined,
        commitmentKind: (searchParams.get("commitmentKind") as CommitmentKind | null) ?? undefined,
        from: searchParams.get("from") ?? undefined,
        to: searchParams.get("to") ?? undefined,
      },
      sort: (searchParams.get("sort") as FinancialEntrySort | null) ?? "dueDate",
      direction: (searchParams.get("direction") as SortDirection | null) ?? "desc",
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 10),
    });

    return NextResponse.json(result);
  } catch (error) {
    return apiError(error, "Erro ao carregar as finanças.");
  }
}

export async function POST(request: Request) {
  const parsed = financialEntrySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const created = await createCommitment(
    financialEntryRepository,
    commitmentsRepository,
    {
      ...parsed.data,
      description: parsed.data.description ?? "",
      notes: parsed.data.notes ?? "",
      dueDate: parsed.data.dueDate || new Date().toISOString().slice(0, 10),
      paymentDate: parsed.data.paymentDate || null,
      commitmentKind: parsed.data.commitmentKind,
    },
    new Date(),
  );

  return NextResponse.json(created, { status: 201 });
}
