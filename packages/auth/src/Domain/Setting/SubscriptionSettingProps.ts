import { SubscriptionSetting } from './SubscriptionSetting'

export type SubscriptionSettingProps = Omit<
  SubscriptionSetting,
  'uuid' | 'userSubscription' | 'createdAt' | 'updatedAt' | 'serverEncryptionVersion' | 'value'
> & {
  uuid?: string
  createdAt?: number
  updatedAt?: number
  unencryptedValue: string | null
  serverEncryptionVersion?: number
}
