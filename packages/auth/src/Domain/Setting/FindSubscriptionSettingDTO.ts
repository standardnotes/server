import { Uuid } from '@standardnotes/common'
import { SubscriptionSettingName } from '@standardnotes/settings'

export type FindSubscriptionSettingDTO = {
  userUuid: Uuid
  userSubscriptionUuid: Uuid
  subscriptionSettingName: SubscriptionSettingName
  settingUuid?: Uuid
}
