import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'

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
    FileUploadBytesLimit: 'FILE_UPLOAD_BYTES_LIMIT',
    FileUploadBytesUsed: 'FILE_UPLOAD_BYTES_USED',
    EmailUnsubscribeToken: 'EMAIL_UNSUBSCRIBE_TOKEN',
  }

  get value(): string {
    return this.props.value
  }

  isSensitive(): boolean {
    return [SettingName.NAMES.MfaSecret, SettingName.NAMES.ExtensionKey].includes(this.value)
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
