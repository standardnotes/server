import { SubscriptionSettingName } from '@standardnotes/settings'

export type GetSubscriptionSettingDTO = {
  userUuid: string
  subscriptionSettingName: SubscriptionSettingName
  allowSensitiveRetrieval?: boolean
}
