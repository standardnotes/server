import { SubscriptionName } from '@standardnotes/common'

export interface SubscriptionRefundedEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  timestamp: number
  offline: boolean
}
