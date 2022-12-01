import { Uuid } from '@standardnotes/common'

export type FindSubscriptionSettingDTO = {
  userUuid: Uuid
  userSubscriptionUuid: Uuid
  subscriptionSettingName: string
  settingUuid?: Uuid
}
