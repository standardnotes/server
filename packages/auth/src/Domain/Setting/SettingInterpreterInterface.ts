import { User } from '../User/User'

export interface SettingInterpreterInterface {
  interpretSettingUpdated(updatedSettingName: string, user: User, newUnencryptedValue: string | null): Promise<void>
}
