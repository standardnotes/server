import { Username, Uuid } from '@standardnotes/domain-core'

import { SubscriptionEventType } from '../../Subscription/SubscriptionEventType'
import { SubscriptionPlanName } from '../../Subscription/SubscriptionPlanName'

export interface SaveRevenueModificationDTO {
  eventType: SubscriptionEventType
  payedAmount: number
  planName: SubscriptionPlanName
  newSubscriber: boolean
  userUuid: Uuid
  username: Username
  subscriptionId: number
  billingFrequency: number
}
