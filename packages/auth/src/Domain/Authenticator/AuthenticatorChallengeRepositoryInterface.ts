import { Uuid } from '@standardnotes/domain-core'

import { AuthenticatorChallenge } from './AuthenticatorChallenge'

export interface AuthenticatorChallengeRepositoryInterface {
  findByUserUuidAndChallenge(userUuid: Uuid, challenge: Buffer): Promise<AuthenticatorChallenge | null>
  findByUserUuid(userUuid: Uuid): Promise<AuthenticatorChallenge | null>
  save(authenticatorChallenge: AuthenticatorChallenge): Promise<void>
}
