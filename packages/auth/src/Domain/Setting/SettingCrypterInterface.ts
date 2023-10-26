import { Uuid } from '@standardnotes/domain-core'

import { Setting } from './Setting'
import { SubscriptionSetting } from './SubscriptionSetting'

export interface SettingCrypterInterface {
  encryptValue(value: string | null, userUuid: Uuid): Promise<string | null>
  decryptSettingValue(value: Setting, userUuid: string): Promise<string | null>
  decryptSubscriptionSettingValue(setting: SubscriptionSetting, userUuid: string): Promise<string | null>
}
