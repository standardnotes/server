import { Uuid } from '@standardnotes/common'
import { Setting } from './Setting'
import { SubscriptionSetting } from './SubscriptionSetting'

export interface SettingDecrypterInterface {
  decryptSettingValue(setting: Setting | SubscriptionSetting, userUuid: Uuid): Promise<string | null>
}
