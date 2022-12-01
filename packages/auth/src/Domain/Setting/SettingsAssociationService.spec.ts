import 'reflect-metadata'

import { SettingName } from '@standardnotes/domain-core'
import { PermissionName } from '@standardnotes/features'

import { SettingsAssociationService } from './SettingsAssociationService'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { SettingDescription } from './SettingDescription'

describe('SettingsAssociationService', () => {
  const createService = () => new SettingsAssociationService()

  it('should tell if a setting is mutable by the client', () => {
    expect(createService().isSettingMutableByClient(SettingName.NAMES.DropboxBackupFrequency)).toBeTruthy()
  })

  it('should tell if a setting is immutable by the client', () => {
    expect(createService().isSettingMutableByClient(SettingName.NAMES.ListedAuthorSecrets)).toBeFalsy()
  })

  it('should return default encryption version for a setting which enecryption version is not strictly defined', () => {
    expect(createService().getEncryptionVersionForSetting(SettingName.NAMES.MfaSecret)).toEqual(
      EncryptionVersion.Default,
    )
  })

  it('should return a defined encryption version for a setting which enecryption version is strictly defined', () => {
    expect(createService().getEncryptionVersionForSetting(SettingName.NAMES.EmailBackupFrequency)).toEqual(
      EncryptionVersion.Unencrypted,
    )
  })

  it('should return default sensitivity for a setting which sensitivity is not strictly defined', () => {
    expect(createService().getSensitivityForSetting(SettingName.NAMES.DropboxBackupToken)).toBeTruthy()
  })

  it('should return a defined sensitivity for a setting which sensitivity is strictly defined', () => {
    expect(createService().getSensitivityForSetting(SettingName.NAMES.DropboxBackupFrequency)).toBeFalsy()
  })

  it('should return the default set of settings for a newly registered user', () => {
    const settings = createService().getDefaultSettingsAndValuesForNewUser()
    const flatSettings = [...(settings as Map<string, SettingDescription>).keys()]
    expect(flatSettings).toEqual(['MUTE_SIGN_IN_EMAILS', 'MUTE_MARKETING_EMAILS', 'LOG_SESSION_USER_AGENT'])
  })

  it('should return the default set of settings for a newly registered vault account', () => {
    const settings = createService().getDefaultSettingsAndValuesForNewVaultAccount()
    const flatSettings = [...(settings as Map<string, SettingDescription>).keys()]
    expect(flatSettings).toEqual(['MUTE_SIGN_IN_EMAILS', 'MUTE_MARKETING_EMAILS', 'LOG_SESSION_USER_AGENT'])

    expect(settings.get(SettingName.NAMES.LogSessionUserAgent)?.value).toEqual('disabled')
  })

  it('should return a permission name associated to a given setting', () => {
    expect(createService().getPermissionAssociatedWithSetting(SettingName.NAMES.EmailBackupFrequency)).toEqual(
      PermissionName.DailyEmailBackup,
    )
  })

  it('should not return a permission name if not associated to a given setting', () => {
    expect(createService().getPermissionAssociatedWithSetting(SettingName.NAMES.ExtensionKey)).toBeUndefined()
  })
})
