import { NextResponse } from "next/server";
import { payFinancialEntry } from "@/application/use-cases/pay-financial-entry";
import { financialEntryRepository } from "@/infrastructure/repositories/prisma-financial-entry.repository";
import { commitmentsRepository } from "@/infrastructure/repositories/prisma-commitments.repository";
import { format } from "date-fns";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const paid = await payFinancialEntry(
      financialEntryRepository,
      commitmentsRepository,
      id,
      format(new Date(), "yyyy-MM-dd"),
    );
    return NextResponse.json(paid);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao baixar pagamento." },
      { status: 404 },
    );
  }
}
