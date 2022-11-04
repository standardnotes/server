import { SubscriptionName } from '@standardnotes/common'

export interface SubscriptionCancelledEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  subscriptionCreatedAt: number
  subscriptionUpdatedAt: number
  lastPayedAt: number
  subscriptionEndsAt: number
  timestamp: number
  offline: boolean
  replaced: boolean
}
