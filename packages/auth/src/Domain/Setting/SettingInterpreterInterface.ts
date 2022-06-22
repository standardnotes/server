import { User } from '../User/User'
import { Setting } from './Setting'

export interface SettingInterpreterInterface {
  interpretSettingUpdated(updatedSetting: Setting, user: User, newUnencryptedValue: string | null): Promise<void>
}
