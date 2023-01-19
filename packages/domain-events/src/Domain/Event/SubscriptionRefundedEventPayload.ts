export interface SubscriptionRefundedEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: string
  userExistingSubscriptionsCount: number
  totalActiveSubscriptionsCount: number
  timestamp: number
  offline: boolean
  billingFrequency: number
  payAmount: number
}
