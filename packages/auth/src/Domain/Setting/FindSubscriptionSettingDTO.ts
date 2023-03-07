import { SettingName } from '@standardnotes/settings'

export type FindSubscriptionSettingDTO = {
  userUuid: string
  userSubscriptionUuid: string
  subscriptionSettingName: SettingName
  settingUuid?: string
}
