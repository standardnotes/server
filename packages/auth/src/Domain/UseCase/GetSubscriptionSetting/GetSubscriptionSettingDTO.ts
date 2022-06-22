import { Uuid } from '@standardnotes/common'
import { SubscriptionSettingName } from '@standardnotes/settings'

export type GetSubscriptionSettingDTO = {
  userUuid: Uuid
  subscriptionSettingName: SubscriptionSettingName
  allowSensitiveRetrieval?: boolean
}
