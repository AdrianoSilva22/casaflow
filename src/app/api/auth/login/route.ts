import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/constants/product";
import { InvalidCredentialsError, loginUseCase } from "@/application/use-cases/login";
import { findUserByLogin } from "@/infrastructure/repositories/prisma-user.repository";
import { loginSchema } from "@/validators/financial-entry.schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  try {
    const session = await loginUseCase(parsed.data.login, parsed.data.password, findUserByLogin);
    const response = NextResponse.json(session);
    response.cookies.set(SESSION_COOKIE, JSON.stringify(session), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: "Erro ao entrar." }, { status: 500 });
  }
}
