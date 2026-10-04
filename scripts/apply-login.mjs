import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

await prisma.$executeRawUnsafe("ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT");
await prisma.$executeRawUnsafe(`
  UPDATE users
  SET username = 'silva',
      password_hash = '$2b$10$hE4H8bTlqAw9EH2Rb2K4mOeD16OotGWB3Jl4QQW2j1Fd9e4pEsPXK'
  WHERE id = 'user_adriano'
`);
await prisma.$executeRawUnsafe("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username)");

console.log("login atualizado: silva");
await prisma.$disconnect();
