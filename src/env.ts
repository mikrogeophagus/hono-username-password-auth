import process from "node:process"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    VALKEY_HOST: z.string(),
    VALKEY_PORT: z.coerce.number().positive(),

    DATABASE_URL: z.string().url(),

    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
