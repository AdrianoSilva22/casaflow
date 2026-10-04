import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/constants/product";
import type { AuthSession } from "@/domain/entities/user";

export async function GET() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return NextResponse.json(null);

  try {
    return NextResponse.json(JSON.parse(raw) as AuthSession);
  } catch {
    return NextResponse.json(null);
  }
}
