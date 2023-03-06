import { PermissionName } from '@standardnotes/features'
import {
  LogSessionUserAgentOption,
  MuteMarketingEmailsOption,
  MuteSignInEmailsOption,
  SettingName,
} from '@standardnotes/settings'
import { injectable } from 'inversify'

import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { SettingDescription } from './SettingDescription'

import { SettingsAssociationServiceInterface } from './SettingsAssociationServiceInterface'

@injectable()
export class SettingsAssociationService implements SettingsAssociationServiceInterface {
  private readonly UNENCRYPTED_SETTINGS = [
    SettingName.EmailBackupFrequency,
    SettingName.MuteFailedBackupsEmails,
    SettingName.MuteFailedCloudBackupsEmails,
    SettingName.MuteSignInEmails,
    SettingName.MuteMarketingEmails,
    SettingName.DropboxBackupFrequency,
    SettingName.GoogleDriveBackupFrequency,
    SettingName.OneDriveBackupFrequency,
    SettingName.LogSessionUserAgent,
  ]

  private readonly UNSENSITIVE_SETTINGS = [
    SettingName.DropboxBackupFrequency,
    SettingName.GoogleDriveBackupFrequency,
    SettingName.OneDriveBackupFrequency,
    SettingName.EmailBackupFrequency,
    SettingName.MuteFailedBackupsEmails,
    SettingName.MuteFailedCloudBackupsEmails,
    SettingName.MuteSignInEmails,
    SettingName.MuteMarketingEmails,
    SettingName.ListedAuthorSecrets,
    SettingName.LogSessionUserAgent,
  ]

  private readonly CLIENT_IMMUTABLE_SETTINGS = [SettingName.ListedAuthorSecrets]

  private readonly permissionsAssociatedWithSettings = new Map<SettingName, PermissionName>([
    [SettingName.EmailBackupFrequency, PermissionName.DailyEmailBackup],
    [SettingName.MuteSignInEmails, PermissionName.SignInAlerts],
  ])

  private readonly defaultSettings = new Map<SettingName, SettingDescription>([
    [
      SettingName.MuteSignInEmails,
      {
        sensitive: false,
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
        value: MuteSignInEmailsOption.Muted,
        replaceable: false,
      },
    ],
    [
      SettingName.MuteMarketingEmails,
      {
        sensitive: false,
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
        value: MuteMarketingEmailsOption.NotMuted,
        replaceable: false,
      },
    ],
    [
      SettingName.LogSessionUserAgent,
      {
        sensitive: false,
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
        value: LogSessionUserAgentOption.Enabled,
        replaceable: false,
      },
    ],
  ])

  private readonly vaultAccountDefaultSettingsOverwrites = new Map<SettingName, SettingDescription>([
    [
      SettingName.LogSessionUserAgent,
      {
        sensitive: false,
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
        value: LogSessionUserAgentOption.Disabled,
        replaceable: false,
      },
    ],
  ])

  isSettingMutableByClient(settingName: SettingName): boolean {
    if (this.CLIENT_IMMUTABLE_SETTINGS.includes(settingName)) {
      return false
    }

    return true
  }

  getSensitivityForSetting(settingName: SettingName): boolean {
    if (this.UNSENSITIVE_SETTINGS.includes(settingName)) {
      return false
    }

    return true
  }

  getEncryptionVersionForSetting(settingName: SettingName): EncryptionVersion {
    if (this.UNENCRYPTED_SETTINGS.includes(settingName)) {
      return EncryptionVersion.Unencrypted
    }

    return EncryptionVersion.Default
  }

  getPermissionAssociatedWithSetting(settingName: SettingName): PermissionName | undefined {
    if (!this.permissionsAssociatedWithSettings.has(settingName)) {
      return undefined
    }

    return this.permissionsAssociatedWithSettings.get(settingName)
  }

  getDefaultSettingsAndValuesForNewUser(): Map<SettingName, SettingDescription> {
    return this.defaultSettings
  }

  getDefaultSettingsAndValuesForNewVaultAccount(): Map<SettingName, SettingDescription> {
    const defaultVaultSettings = new Map(this.defaultSettings)

    for (const vaultAccountDefaultSettingOverwriteKey of this.vaultAccountDefaultSettingsOverwrites.keys()) {
      defaultVaultSettings.set(
        vaultAccountDefaultSettingOverwriteKey,
        this.vaultAccountDefaultSettingsOverwrites.get(vaultAccountDefaultSettingOverwriteKey) as SettingDescription,
      )
    }

    return defaultVaultSettings
  }
}
