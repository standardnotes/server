import { SubscriptionPlanName } from '../Subscription/SubscriptionPlanName'

export interface SubscriptionProps {
  planName: SubscriptionPlanName
  isFirstSubscriptionForUser: boolean
  payedAmount: number
  billingFrequency: number
}
