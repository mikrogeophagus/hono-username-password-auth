import "hono"
import type { User } from "./lib/user.js"
import type { Session } from "./lib/session.js"

declare module "hono" {
  interface ContextVariableMap {
    user: User | null
    session: Session | null
  }
}
