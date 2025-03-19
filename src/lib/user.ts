import { prisma } from "./db.js"
import type { User as PrismaUser } from "@prisma/client"

export type User = Pick<
  PrismaUser,
  "id" | "email" | "emailVerified" | "createdAt" | "updatedAt"
>

export async function updateUserEmailAndSetEmailAsVerified(
  userId: number,
  email: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { email, emailVerified: true },
  })
}
