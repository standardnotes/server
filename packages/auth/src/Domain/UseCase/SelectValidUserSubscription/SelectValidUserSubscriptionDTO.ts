import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'

export type SelectValidUserSubscriptionDTO = {
  userUuid: string
  subscriptionType?: UserSubscriptionType
}
