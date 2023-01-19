export interface SubscriptionExpiredEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: string
  timestamp: number
  offline: boolean
  totalActiveSubscriptionsCount: number
  userExistingSubscriptionsCount: number
  billingFrequency: number
  payAmount: number
}
