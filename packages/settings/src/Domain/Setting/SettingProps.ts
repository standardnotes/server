import { EncryptionVersion, SettingName, Timestamps, Uuid } from '@standardnotes/domain-core'

export interface SettingProps {
  userUuid: Uuid
  name: SettingName
  value: string | null
  serverEncryptionVersion: EncryptionVersion
  sensitive: boolean
  timestamps: Timestamps
}
