import { NextResponse } from "next/server";
import { financialEntryRepository } from "@/infrastructure/repositories/prisma-financial-entry.repository";
import { commitmentsRepository } from "@/infrastructure/repositories/prisma-commitments.repository";
import { buildMonthlyReport } from "@/domain/services/monthly-report";
import { format } from "date-fns";
import { apiError } from "@/lib/api-route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || format(new Date(), "yyyy-MM");

    const [plans, recurring, entries] = await Promise.all([
      commitmentsRepository.listPlans(),
      commitmentsRepository.listRecurring(),
      financialEntryRepository.list(),
    ]);

    const report = buildMonthlyReport(month, plans, recurring, entries);
    return NextResponse.json(report);
  } catch (error) {
    return apiError(error, "Erro ao gerar o relatório mensal.");
  }
}
