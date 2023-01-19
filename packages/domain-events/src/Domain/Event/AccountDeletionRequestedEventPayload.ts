export interface AccountDeletionRequestedEventPayload {
  userUuid: string
  userCreatedAtTimestamp: number
  regularSubscriptionUuid: string | undefined
}
