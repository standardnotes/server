import { Base64String, HexString, Utf8String } from '@standardnotes/sncrypto-common'
import { User } from '../User/User'

export interface CrypterInterface {
  encryptForUser(value: string, user: User): Promise<string>
  decryptForUser(value: string, user: User): Promise<string>
  generateEncryptedUserServerKey(): Promise<string>
  decryptUserServerKey(user: User): Promise<string>
  sha256Hash(text: Utf8String): HexString
  base64URLEncode(text: Utf8String): Base64String
}
