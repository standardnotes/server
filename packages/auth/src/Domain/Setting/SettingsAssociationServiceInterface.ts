import { PermissionName } from '@standardnotes/features'
import { SettingName, SubscriptionSettingName } from '@standardnotes/settings'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { SettingDescription } from './SettingDescription'

export interface SettingsAssociationServiceInterface {
  getDefaultSettingsAndValuesForNewUser(): Map<SettingName, SettingDescription>
  getDefaultSettingsAndValuesForNewVaultAccount(): Map<SettingName, SettingDescription>
  getPermissionAssociatedWithSetting(settingName: SettingName): PermissionName | undefined
  getEncryptionVersionForSetting(settingName: SettingName): EncryptionVersion
  getSensitivityForSetting(settingName: SettingName): boolean
  isSettingMutableByClient(settingName: SettingName | SubscriptionSettingName): boolean
}
