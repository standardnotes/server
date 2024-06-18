import { Session } from '../../Session/Session'

export interface GetSessionFromTokenResult {
  session: Session
  isEphemeral: boolean
  givenTokensWereInCooldown: boolean
  cooldownHashedRefreshToken?: string
}
