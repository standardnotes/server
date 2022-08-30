import { SubscriptionName } from '@standardnotes/common'

export interface SubscriptionCancelledEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  timestamp: number
  offline: boolean
  replaced: boolean
}
