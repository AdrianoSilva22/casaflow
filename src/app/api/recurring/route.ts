import { NextResponse } from "next/server";
import { listRecurringExpenses } from "@/application/use-cases/list-recurring-expenses";
import { commitmentsRepository } from "@/infrastructure/repositories/prisma-commitments.repository";

import { apiError } from "@/lib/api-route";

export async function GET() {
  try {
    const items = await listRecurringExpenses(commitmentsRepository);
    return NextResponse.json(items);
  } catch (error) {
    return apiError(error, "Erro ao carregar as recorrentes.");
  }
}
