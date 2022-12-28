import { AuthenticatorChallenge } from './AuthenticatorChallenge'

export interface AuthenticatorChallengeRepositoryInterface {
  save(authenticatorChallenge: AuthenticatorChallenge): Promise<void>
}
