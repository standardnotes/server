export interface AccountDeletionRequestedEventPayload {
  userUuid: string
  email: string
  userCreatedAtTimestamp: number
  regularSubscription?: {
    uuid: string
    ownerUuid: string
  }
  sharedSubscription?: {
    uuid: string
    ownerUuid: string
  }
}
