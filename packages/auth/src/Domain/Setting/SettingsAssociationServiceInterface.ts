import { PermissionName } from '@standardnotes/features'
import { SubscriptionSettingName } from '@standardnotes/settings'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { SettingDescription } from './SettingDescription'

export interface SettingsAssociationServiceInterface {
  getDefaultSettingsAndValuesForNewUser(): Map<string, SettingDescription>
  getDefaultSettingsAndValuesForNewVaultAccount(): Map<string, SettingDescription>
  getPermissionAssociatedWithSetting(settingName: string): PermissionName | undefined
  getEncryptionVersionForSetting(settingName: string): EncryptionVersion
  getSensitivityForSetting(settingName: string): boolean
  isSettingMutableByClient(settingName: string | SubscriptionSettingName): boolean
}
