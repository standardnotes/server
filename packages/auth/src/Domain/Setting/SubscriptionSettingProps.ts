import { Timestamps, Uuid } from '@standardnotes/domain-core'

export interface SubscriptionSettingProps {
  name: string
  value: string | null
  serverEncryptionVersion: number
  timestamps: Timestamps
  sensitive: boolean
  userSubscriptionUuid: Uuid
}
