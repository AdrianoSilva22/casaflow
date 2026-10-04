import { NextResponse } from "next/server";
import { financialEntryRepository } from "@/infrastructure/repositories/prisma-financial-entry.repository";
import { deleteFinancialEntry } from "@/application/use-cases/delete-financial-entry";
import { updateFinancialEntry } from "@/application/use-cases/update-financial-entry";
import { financialEntryUpdateSchema } from "@/validators/financial-entry.schema";
import { withResolvedStatus } from "@/domain/services/entry-status";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const entry = await financialEntryRepository.findById(id);
  if (!entry) {
    return NextResponse.json({ message: "Lançamento não encontrado." }, { status: 404 });
  }
  return NextResponse.json(withResolvedStatus(entry));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = financialEntryUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  try {
    const updated = await updateFinancialEntry(financialEntryRepository, id, {
      ...parsed.data,
      paymentDate: parsed.data.paymentDate === "" ? null : parsed.data.paymentDate,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao atualizar." },
      { status: 404 },
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await deleteFinancialEntry(financialEntryRepository, id);
  return new NextResponse(null, { status: 204 });
}
