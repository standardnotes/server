import { SubscriptionName } from '@standardnotes/common'

export interface SubscriptionReactivatedEventPayload {
  userEmail: string
  previousSubscriptionId: number
  currentSubscriptionId: number
  subscriptionName: SubscriptionName
  subscriptionExpiresAt: number
  discountCode: string | null
}
