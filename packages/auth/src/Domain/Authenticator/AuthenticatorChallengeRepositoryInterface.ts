import { Uuid } from '@standardnotes/domain-core'

import { AuthenticatorChallenge } from './AuthenticatorChallenge'

export interface AuthenticatorChallengeRepositoryInterface {
  findByUserUuid(userUuid: Uuid): Promise<AuthenticatorChallenge | null>
  save(authenticatorChallenge: AuthenticatorChallenge): Promise<void>
}
