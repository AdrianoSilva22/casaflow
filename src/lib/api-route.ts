import { NextResponse } from "next/server";

export function apiError(error: unknown, fallback = "Erro ao carregar os dados.") {
  console.error(error);
  const message = error instanceof Error && error.message ? error.message : fallback;
  return NextResponse.json({ message }, { status: 500 });
}
