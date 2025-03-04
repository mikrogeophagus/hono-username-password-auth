import { Prisma, PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient()

export function isPrismaClientKnownRequestError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError
}
