import { Uuid } from '@standardnotes/common'

export interface AccountDeletionRequestedEventPayload {
  userUuid: string
  regularSubscriptionUuid: Uuid | undefined
}
