import { SubscriptionName } from '@standardnotes/common'

export interface SubscriptionPurchasedEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  subscriptionExpiresAt: number
  timestamp: number
  offline: boolean
  discountCode: string | null
  limitedDiscountPurchased: boolean
  newSubscriber: boolean
  totalActiveSubscriptionsCount: number
  userRegisteredAt: number
  billingFrequency: number
  payAmount: number
}
