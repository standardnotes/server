import { Setting } from './Setting'
import { SubscriptionSetting } from './SubscriptionSetting'

export interface SettingDecrypterInterface {
  decryptSettingValue(setting: Setting | SubscriptionSetting, userUuid: string): Promise<string | null>
}
