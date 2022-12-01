import { Uuid } from '@standardnotes/common'

export type GetSubscriptionSettingDTO = {
  userUuid: Uuid
  subscriptionSettingName: string
  allowSensitiveRetrieval?: boolean
}
