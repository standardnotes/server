import { SubscriptionName } from '@standardnotes/common'

export interface SubscriptionExpiredEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  timestamp: number
  offline: boolean
  totalActiveSubscriptionsCount: number
}
