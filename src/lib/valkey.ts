import { Redis } from "ioredis"
import { env } from "../env.js"

export const valkey = new Redis({
  host: env.VALKEY_HOST,
  port: env.VALKEY_PORT,
})
