export interface SubscriptionCancelledEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: string
  subscriptionCreatedAt: number
  subscriptionUpdatedAt: number
  lastPayedAt: number
  subscriptionEndsAt: number
  timestamp: number
  offline: boolean
  replaced: boolean
  userExistingSubscriptionsCount: number
  billingFrequency: number
  payAmount: number
}
