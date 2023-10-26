import { PermissionName } from '@standardnotes/features'
import { LogSessionUserAgentOption, MuteMarketingEmailsOption, SettingName } from '@standardnotes/settings'
import { injectable } from 'inversify'

import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { SettingDescription } from './SettingDescription'

import { SettingsAssociationServiceInterface } from './SettingsAssociationServiceInterface'

@injectable()
export class SettingsAssociationService implements SettingsAssociationServiceInterface {
  private readonly UNENCRYPTED_SETTINGS = [
    SettingName.NAMES.EmailBackupFrequency,
    SettingName.NAMES.MuteFailedBackupsEmails,
    SettingName.NAMES.MuteFailedCloudBackupsEmails,
    SettingName.NAMES.MuteSignInEmails,
    SettingName.NAMES.MuteMarketingEmails,
    SettingName.NAMES.DropboxBackupFrequency,
    SettingName.NAMES.GoogleDriveBackupFrequency,
    SettingName.NAMES.OneDriveBackupFrequency,
    SettingName.NAMES.LogSessionUserAgent,
  ]

  private readonly UNSENSITIVE_SETTINGS = [
    SettingName.NAMES.DropboxBackupFrequency,
    SettingName.NAMES.GoogleDriveBackupFrequency,
    SettingName.NAMES.OneDriveBackupFrequency,
    SettingName.NAMES.EmailBackupFrequency,
    SettingName.NAMES.MuteFailedBackupsEmails,
    SettingName.NAMES.MuteFailedCloudBackupsEmails,
    SettingName.NAMES.MuteSignInEmails,
    SettingName.NAMES.MuteMarketingEmails,
    SettingName.NAMES.ListedAuthorSecrets,
    SettingName.NAMES.LogSessionUserAgent,
    SettingName.NAMES.RecoveryCodes,
  ]

  private readonly CLIENT_IMMUTABLE_SETTINGS = [
    SettingName.NAMES.ListedAuthorSecrets,
    SettingName.NAMES.FileUploadBytesLimit,
    SettingName.NAMES.FileUploadBytesUsed,
  ]

  private readonly permissionsAssociatedWithSettings = new Map<string, PermissionName>([
    [SettingName.NAMES.EmailBackupFrequency, PermissionName.DailyEmailBackup],
    [SettingName.NAMES.MuteSignInEmails, PermissionName.SignInAlerts],
  ])

  private readonly defaultSettings = new Map<string, SettingDescription>([
    [
      SettingName.NAMES.MuteMarketingEmails,
      {
        value: MuteMarketingEmailsOption.NotMuted,
        replaceable: false,
      },
    ],
    [
      SettingName.NAMES.LogSessionUserAgent,
      {
        value: LogSessionUserAgentOption.Enabled,
        replaceable: false,
      },
    ],
  ])

  private readonly privateUsernameAccountDefaultSettingsOverwrites = new Map<string, SettingDescription>([
    [
      SettingName.NAMES.LogSessionUserAgent,
      {
        value: LogSessionUserAgentOption.Disabled,
        replaceable: false,
      },
    ],
  ])

  isSettingMutableByClient(settingName: SettingName): boolean {
    if (this.CLIENT_IMMUTABLE_SETTINGS.includes(settingName.value)) {
      return false
    }

    return true
  }

  getSensitivityForSetting(settingName: SettingName): boolean {
    if (this.UNSENSITIVE_SETTINGS.includes(settingName.value)) {
      return false
    }

    return true
  }

  getEncryptionVersionForSetting(settingName: SettingName): EncryptionVersion {
    if (this.UNENCRYPTED_SETTINGS.includes(settingName.value)) {
      return EncryptionVersion.Unencrypted
    }

    return EncryptionVersion.Default
  }

  getPermissionAssociatedWithSetting(settingName: SettingName): PermissionName | undefined {
    if (!this.permissionsAssociatedWithSettings.has(settingName.value)) {
      return undefined
    }

    return this.permissionsAssociatedWithSettings.get(settingName.value)
  }

  getDefaultSettingsAndValuesForNewUser(): Map<string, SettingDescription> {
    return this.defaultSettings
  }

  getDefaultSettingsAndValuesForNewPrivateUsernameAccount(): Map<string, SettingDescription> {
    const defaultPrivateUsernameSettings = new Map(this.defaultSettings)

    for (const privateUsernameAccountDefaultSettingOverwriteKey of this.privateUsernameAccountDefaultSettingsOverwrites.keys()) {
      defaultPrivateUsernameSettings.set(
        privateUsernameAccountDefaultSettingOverwriteKey,
        this.privateUsernameAccountDefaultSettingsOverwrites.get(
          privateUsernameAccountDefaultSettingOverwriteKey,
        ) as SettingDescription,
      )
    }

    return defaultPrivateUsernameSettings
  }
}
