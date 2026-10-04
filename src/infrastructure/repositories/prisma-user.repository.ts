import { prisma } from "@/infrastructure/db/prisma";
import { toUser } from "@/infrastructure/db/mappers";
import type { AuthUserRecord } from "@/application/use-cases/login";
import { findLocalUserByLogin } from "@/infrastructure/repositories/local-user";

export async function findUserByLogin(login: string): Promise<AuthUserRecord | null> {
  const normalized = login.trim().toLowerCase();

  try {
    const row = await prisma.user.findFirst({
      where: normalized === "silva" ? { id: "user_adriano" } : { email: normalized },
    });

    if (!row) return findLocalUserByLogin(normalized);

    return {
      ...toUser(row),
      passwordHash: row.passwordHash,
      familyId: row.familyId,
    };
  } catch {
    return findLocalUserByLogin(normalized);
  }
}
