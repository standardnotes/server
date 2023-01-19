import { SubscriptionSettingName } from '@standardnotes/settings'

export type FindSubscriptionSettingDTO = {
  userUuid: string
  userSubscriptionUuid: string
  subscriptionSettingName: SubscriptionSettingName
  settingUuid?: string
}
