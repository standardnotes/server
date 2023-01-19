export interface SubscriptionReactivatedEventPayload {
  userEmail: string
  previousSubscriptionId: number
  currentSubscriptionId: number
  subscriptionName: string
  subscriptionExpiresAt: number
  discountCode: string | null
}
