import { Setting } from './Setting'
import { SubscriptionSetting } from './SubscriptionSetting'

export interface SettingDecrypterInterface {
  decryptSettingValue(setting: Setting, userUuid: string): Promise<string | null>
  decryptSubscriptionSettingValue(setting: SubscriptionSetting, userUuid: string): Promise<string | null>
}
