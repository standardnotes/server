import { Setting } from './Setting'

export type SettingProps = Omit<
  Setting,
  'uuid' | 'user' | 'createdAt' | 'updatedAt' | 'serverEncryptionVersion' | 'value'
> & {
  uuid?: string
  createdAt?: number
  updatedAt?: number
  unencryptedValue: string | null
  serverEncryptionVersion?: number
}
