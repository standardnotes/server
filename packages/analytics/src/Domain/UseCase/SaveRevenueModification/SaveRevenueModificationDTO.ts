import { Email } from '../../Common/Email'
import { Uuid } from '../../Common/Uuid'
import { SubscriptionEventType } from '../../Subscription/SubscriptionEventType'
import { SubscriptionPlanName } from '../../Subscription/SubscriptionPlanName'

export interface SaveRevenueModificationDTO {
  eventType: SubscriptionEventType
  payedAmount: number
  planName: SubscriptionPlanName
  newSubscriber: boolean
  userUuid: Uuid
  userEmail: Email
  subscriptionId: number
  billingFrequency: number
}
