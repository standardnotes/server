import { Session } from '../Session/Session'
import { AuthResponse20161215 } from './AuthResponse20161215'
import { AuthResponse20200115 } from './AuthResponse20200115'

export interface AuthResponseCreationResult {
  response?: AuthResponse20200115
  legacyResponse?: AuthResponse20161215
  session?: Session
  cookies?: { accessToken: string; refreshToken: string }
}
