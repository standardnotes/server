import { EncryptionVersion } from '../Encryption/EncryptionVersion'

export type SettingDescription = {
  value: string
  sensitive: boolean
  serverEncryptionVersion: EncryptionVersion
  replaceable: boolean
}
