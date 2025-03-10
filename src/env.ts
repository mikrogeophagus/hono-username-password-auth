import process from "node:process"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    VALKEY_HOST: z.string(),
    VALKEY_PORT: z.coerce.number().positive(),

    DATABASE_URL: z.string().url(),

    NODE_ENV: z.enum(["development", "production"]).default("development"),

    // EMAIL_SERVER: z.string().url(),
    // EMAIL_FROM: z.string().email(),

    GOOGLE_EMAIL: z.string().email(),
    GOOGLE_APP_PASSWORD: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
