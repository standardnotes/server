import { UserSubscription } from '../Subscription/UserSubscription'
import { User } from '../User/User'
import { SubscriptionSettingProps } from './SubscriptionSettingProps'

export type CreateOrReplaceSubscriptionSettingDTO = {
  userSubscription: UserSubscription
  user: User
  props: SubscriptionSettingProps
}
