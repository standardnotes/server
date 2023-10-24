import { Timestamps, Uuid } from '@standardnotes/domain-core'

export interface SettingProps {
  name: string
  value: string | null
  serverEncryptionVersion: number
  timestamps: Timestamps
  sensitive: boolean
  userUuid: Uuid
}
