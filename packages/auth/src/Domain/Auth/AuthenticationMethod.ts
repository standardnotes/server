import { RevokedSession } from '../Session/RevokedSession'
import { Session } from '../Session/Session'
import { User } from '../User/User'

export type AuthenticationMethod = {
  type: 'jwt' | 'session_token' | 'revoked'
  user: User | null
  claims?: Record<string, unknown>
  session?: Session
  givenTokensWereInCooldown?: boolean
  revokedSession?: RevokedSession
}
