export interface SubscriptionRenewedEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: string
  subscriptionExpiresAt: number
  timestamp: number
  offline: boolean
  billingFrequency: number
  payAmount: number
}
