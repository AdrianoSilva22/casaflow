import { NextResponse } from "next/server";
import { getMonthSummary } from "@/application/use-cases/get-month-summary";
import { financialEntryRepository } from "@/infrastructure/repositories/prisma-financial-entry.repository";
import { commitmentsRepository } from "@/infrastructure/repositories/prisma-commitments.repository";
import { format } from "date-fns";

import { apiError } from "@/lib/api-route";

export async function GET(request: Request) {
  try {
    const month = new URL(request.url).searchParams.get("month") ?? format(new Date(), "yyyy-MM");
    const summary = await getMonthSummary(
      financialEntryRepository,
      commitmentsRepository,
      month,
      new Date(),
    );
    return NextResponse.json(summary);
  } catch (error) {
    return apiError(error, "Erro ao carregar o resumo.");
  }
}
