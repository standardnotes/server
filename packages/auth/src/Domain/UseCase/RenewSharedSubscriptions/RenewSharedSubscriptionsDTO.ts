export interface RenewSharedSubscriptionsDTO {
  inviterEmail: string
  newSubscriptionId: number
  newSubscriptionExpiresAt: number
  newSubscriptionName: string
  timestamp: number
}
