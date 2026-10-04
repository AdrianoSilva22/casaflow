import { NextResponse } from "next/server";
import { listPaymentHistory } from "@/application/use-cases/list-payment-history";
import { commitmentsRepository } from "@/infrastructure/repositories/prisma-commitments.repository";

import { apiError } from "@/lib/api-route";

export async function GET(request: Request) {
  try {
    const month = new URL(request.url).searchParams.get("month") ?? undefined;
    const items = await listPaymentHistory(commitmentsRepository, month);
    return NextResponse.json(items);
  } catch (error) {
    return apiError(error, "Erro ao carregar o histórico.");
  }
}
