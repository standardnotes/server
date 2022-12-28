import { Uuid } from '@standardnotes/domain-core'

export interface AuthenticatorChallengeProps {
  userUuid: Uuid
  challenge: Buffer
  createdAt: Date
}
