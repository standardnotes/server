import { PermissionName } from '@standardnotes/features'
import { SettingName } from '@standardnotes/settings'

import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { SettingDescription } from './SettingDescription'

export interface SettingsAssociationServiceInterface {
  getDefaultSettingsAndValuesForNewUser(): Map<string, SettingDescription>
  getDefaultSettingsAndValuesForNewVaultAccount(): Map<string, SettingDescription>
  getPermissionAssociatedWithSetting(settingName: SettingName): PermissionName | undefined
  getEncryptionVersionForSetting(settingName: SettingName): EncryptionVersion
  getSensitivityForSetting(settingName: SettingName): boolean
  isSettingMutableByClient(settingName: SettingName): boolean
}
