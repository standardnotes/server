import { UserSubscription } from '../Subscription/UserSubscription'
import { SubscriptionSettingProps } from './SubscriptionSettingProps'

export type CreateOrReplaceSubscriptionSettingDTO = {
  userSubscription: UserSubscription
  props: SubscriptionSettingProps
}
