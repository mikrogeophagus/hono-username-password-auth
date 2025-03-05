import type { User as PrismaUser } from "@prisma/client"

export type User = Pick<PrismaUser, "id" | "email" | "createdAt" | "updatedAt">
