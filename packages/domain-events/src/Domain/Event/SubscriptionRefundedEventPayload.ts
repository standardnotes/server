import { SubscriptionName } from '@standardnotes/common'

export interface SubscriptionRefundedEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  userExistingSubscriptionsCount: number
  totalActiveSubscriptionsCount: number
  timestamp: number
  offline: boolean
  billingFrequency: number
  payAmount: number
}
