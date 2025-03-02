import type { Env } from "hono"
import type { User } from "./user.js"
import type { Session } from "./session.js"

export interface Context extends Env {
  Variables: {
    user: User | null
    session: Session | null
  }
}
