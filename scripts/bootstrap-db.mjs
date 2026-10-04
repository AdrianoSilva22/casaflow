import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const families = await prisma.family.findMany();
const users = await prisma.user.findMany();
const categories = await prisma.category.count();

console.log(
  JSON.stringify(
    {
      families: families.map((item) => item.name),
      users: users.map((item) => item.email),
      categories,
    },
    null,
    2,
  ),
);

const hash = bcrypt.hashSync("casaflow123", 10);
const updated = await prisma.user.updateMany({ data: { passwordHash: hash } });
console.log("passwords_updated", updated.count);

await prisma.$disconnect();
