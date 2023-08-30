export interface AccountDeletionRequestedEventPayload {
  userUuid: string
  roleNames: string[]
  userCreatedAtTimestamp: number
  regularSubscriptionUuid: string | undefined
}
