import { Uuid } from '@standardnotes/common'

export interface AccountDeletionRequestedEventPayload {
  userUuid: string
  userCreatedAtTimestamp: number
  regularSubscriptionUuid: Uuid | undefined
}
