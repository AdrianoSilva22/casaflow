import { NextResponse } from "next/server";
import { listInstallmentPlans } from "@/application/use-cases/list-installment-plans";
import { financialEntryRepository } from "@/infrastructure/repositories/prisma-financial-entry.repository";
import { commitmentsRepository } from "@/infrastructure/repositories/prisma-commitments.repository";

import { apiError } from "@/lib/api-route";

export async function GET() {
  try {
    const items = await listInstallmentPlans(financialEntryRepository, commitmentsRepository, new Date());
    return NextResponse.json(items);
  } catch (error) {
    return apiError(error, "Erro ao carregar os parcelamentos.");
  }
}
