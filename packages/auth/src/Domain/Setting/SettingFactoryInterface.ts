import { UserSubscription } from '../Subscription/UserSubscription'
import { User } from '../User/User'
import { Setting } from './Setting'
import { SettingProps } from './SettingProps'
import { SubscriptionSetting } from './SubscriptionSetting'
import { SubscriptionSettingProps } from './SubscriptionSettingProps'

export interface SettingFactoryInterface {
  create(props: SettingProps, user: User): Promise<Setting>
  createSubscriptionSetting(
    props: SubscriptionSettingProps,
    userSubscription: UserSubscription,
  ): Promise<SubscriptionSetting>
  createReplacement(original: Setting, props: SettingProps): Promise<Setting>
  createSubscriptionSettingReplacement(
    original: SubscriptionSetting,
    props: SubscriptionSettingProps,
  ): Promise<SubscriptionSetting>
}
