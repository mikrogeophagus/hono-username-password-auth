import { hash, verify, type Options } from "@node-rs/argon2"

const hashOptions: Options = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, hashOptions)
}

export async function verifyPasswordHash(
  hash: string,
  password: string,
): Promise<boolean> {
  return await verify(hash, password, hashOptions)
}
