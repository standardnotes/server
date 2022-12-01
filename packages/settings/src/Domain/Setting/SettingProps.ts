import { EncryptionVersion, Timestamps, Uuid } from '@standardnotes/domain-core'

import { SettingName } from './SettingName'

export interface SettingProps {
  userUuid: Uuid
  name: SettingName
  value: string | null
  serverEncryptionVersion: EncryptionVersion
  sensitive: boolean
  timestamps: Timestamps
}
