import { NextResponse } from "next/server";
import { commitmentsRepository } from "@/infrastructure/repositories/prisma-commitments.repository";
import { recurringStatusSchema } from "@/validators/financial-entry.schema";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = recurringStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Status inválido." }, { status: 400 });
  }

  try {
    const updated = await commitmentsRepository.updateRecurring(id, {
      status: parsed.data.status,
      endedAt: parsed.data.status === "closed" ? new Date().toISOString().slice(0, 10) : null,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao atualizar." },
      { status: 404 },
    );
  }
}
