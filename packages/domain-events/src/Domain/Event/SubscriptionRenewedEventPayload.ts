import { SubscriptionName } from '@standardnotes/common'

export interface SubscriptionRenewedEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  subscriptionExpiresAt: number
  timestamp: number
  offline: boolean
  billingFrequency: number
  payAmount: number
}
