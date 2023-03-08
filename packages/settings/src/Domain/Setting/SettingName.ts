import { Result, ValueObject } from '@standardnotes/domain-core'

import { SettingNameProps } from './SettingNameProps'

export class SettingName extends ValueObject<SettingNameProps> {
  static readonly NAMES = {
    MfaSecret: 'MFA_SECRET',
    ExtensionKey: 'EXTENSION_KEY',
    EmailBackupFrequency: 'EMAIL_BACKUP_FREQUENCY',
    DropboxBackupFrequency: 'DROPBOX_BACKUP_FREQUENCY',
    DropboxBackupToken: 'DROPBOX_BACKUP_TOKEN',
    OneDriveBackupFrequency: 'ONE_DRIVE_BACKUP_FREQUENCY',
    OneDriveBackupToken: 'ONE_DRIVE_BACKUP_TOKEN',
    GoogleDriveBackupFrequency: 'GOOGLE_DRIVE_BACKUP_FREQUENCY',
    GoogleDriveBackupToken: 'GOOGLE_DRIVE_BACKUP_TOKEN',
    MuteFailedBackupsEmails: 'MUTE_FAILED_BACKUPS_EMAILS',
    MuteFailedCloudBackupsEmails: 'MUTE_FAILED_CLOUD_BACKUPS_EMAILS',
    MuteSignInEmails: 'MUTE_SIGN_IN_EMAILS',
    MuteMarketingEmails: 'MUTE_MARKETING_EMAILS',
    ListedAuthorSecrets: 'LISTED_AUTHOR_SECRETS',
    LogSessionUserAgent: 'LOG_SESSION_USER_AGENT',
    RecoveryCodes: 'RECOVERY_CODES',
    FileUploadBytesLimit: 'FILE_UPLOAD_BYTES_LIMIT',
    FileUploadBytesUsed: 'FILE_UPLOAD_BYTES_USED',
  }

  get value(): string {
    return this.props.value
  }

  isSensitive(): boolean {
    return [SettingName.NAMES.MfaSecret, SettingName.NAMES.ExtensionKey].includes(this.props.value)
  }

  isASubscriptionSetting(): boolean {
    return [
      SettingName.NAMES.FileUploadBytesLimit,
      SettingName.NAMES.FileUploadBytesUsed,
      SettingName.NAMES.MuteSignInEmails,
    ].includes(this.props.value)
  }

  isARegularOnlySubscriptionSetting(): boolean {
    return [SettingName.NAMES.FileUploadBytesLimit, SettingName.NAMES.FileUploadBytesUsed].includes(this.props.value)
  }

  isASharedAndRegularOnlySubscriptionSetting(): boolean {
    return [SettingName.NAMES.MuteSignInEmails].includes(this.props.value)
  }

  private constructor(props: SettingNameProps) {
    super(props)
  }

  static create(name: string): Result<SettingName> {
    const isValidName = Object.values(this.NAMES).includes(name)
    if (!isValidName) {
      return Result.fail<SettingName>(`Invalid setting name: ${name}`)
    } else {
      return Result.ok<SettingName>(new SettingName({ value: name }))
    }
  }
}
