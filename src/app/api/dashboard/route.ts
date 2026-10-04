import { NextResponse } from "next/server";
import { getDashboard } from "@/application/use-cases/get-dashboard";
import { financialEntryRepository } from "@/infrastructure/repositories/prisma-financial-entry.repository";
import { commitmentsRepository } from "@/infrastructure/repositories/prisma-commitments.repository";
import { apiError } from "@/lib/api-route";

export async function GET() {
  try {
    const snapshot = await getDashboard(financialEntryRepository, commitmentsRepository, new Date());
    return NextResponse.json(snapshot);
  } catch (error) {
    return apiError(error, "Erro ao carregar o dashboard.");
  }
}
