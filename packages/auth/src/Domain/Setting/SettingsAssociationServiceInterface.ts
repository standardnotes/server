import { PermissionName } from '@standardnotes/features'
import { SettingName } from '@standardnotes/domain-core'

import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { SettingDescription } from './SettingDescription'

export interface SettingsAssociationServiceInterface {
  getDefaultSettingsAndValuesForNewUser(): Map<string, SettingDescription>
  getDefaultSettingsAndValuesForNewPrivateUsernameAccount(): Map<string, SettingDescription>
  getPermissionAssociatedWithSetting(settingName: SettingName): PermissionName | undefined
  getEncryptionVersionForSetting(settingName: SettingName): EncryptionVersion
  getSensitivityForSetting(settingName: SettingName): boolean
  isSettingMutableByClient(settingName: SettingName): boolean
}
