import { SubscriptionSetting } from './SubscriptionSetting'

export type CreateOrReplaceSubscriptionSettingResponse = {
  status: 'created' | 'replaced'
  subscriptionSetting: SubscriptionSetting
}
