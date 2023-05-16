import { Aes256GcmEncrypted, Base64String, HexString, Utf8String } from '@standardnotes/sncrypto-common'
import { CryptoNode } from '@standardnotes/sncrypto-node'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { User } from '../User/User'
import { CrypterInterface } from './CrypterInterface'

@injectable()
export class CrypterNode implements CrypterInterface {
  constructor(
    @inject(TYPES.Auth_ENCRYPTION_SERVER_KEY) private encryptionServerKey: string,
    @inject(TYPES.Auth_CryptoNode) private cryptoNode: CryptoNode,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {
    const keyBuffer = Buffer.from(encryptionServerKey, 'hex')
    const { byteLength } = keyBuffer

    if (byteLength !== 32) {
      throw Error('ENCRYPTION_SERVER_KEY must be a hex string exactly 32 bytes long!')
    }
  }

  sha256Hash(text: Utf8String): HexString {
    return this.cryptoNode.sha256(text)
  }

  base64URLEncode(text: Utf8String): Base64String {
    return this.cryptoNode.base64URLEncode(text)
  }

  async encryptForUser(unencrypted: string, user: User): Promise<string> {
    const decryptedUserServerKey = await this.decryptUserServerKey(user)
    const iv = await this.cryptoNode.generateRandomKey(128)

    const encrypted = await this.cryptoNode.aes256GcmEncrypt({
      unencrypted,
      iv,
      key: decryptedUserServerKey,
    })

    return this.stringifyVersionedEncrypted(User.DEFAULT_ENCRYPTION_VERSION, encrypted)
  }

  async decryptForUser(formattedEncryptedValue: string, user: User): Promise<string> {
    this.logger.debug('Decrypting for user value: %s', formattedEncryptedValue)

    const decryptedUserServerKey = await this.decryptUserServerKey(user)

    this.logger.debug('Decrypted user server key: %s', decryptedUserServerKey)

    const encrypted = this.parseVersionedEncrypted(formattedEncryptedValue)

    this.logger.debug('Encrypted value: %O', encrypted)

    return this.cryptoNode.aes256GcmDecrypt(encrypted, decryptedUserServerKey)
  }

  async generateEncryptedUserServerKey(): Promise<string> {
    const unencrypted = await this.cryptoNode.generateRandomKey(256)
    const iv = await this.cryptoNode.generateRandomKey(128)

    const encrypted = await this.cryptoNode.aes256GcmEncrypt({
      unencrypted,
      iv,
      key: this.encryptionServerKey,
    })

    return this.stringifyVersionedEncrypted(User.DEFAULT_ENCRYPTION_VERSION, encrypted)
  }

  async decryptUserServerKey(user: User): Promise<string> {
    const encrypted = this.parseVersionedEncrypted(user.encryptedServerKey as string)

    return this.cryptoNode.aes256GcmDecrypt(encrypted, this.encryptionServerKey)
  }

  private stringifyVersionedEncrypted(version: number, encrypted: Aes256GcmEncrypted<BufferEncoding>): string {
    return JSON.stringify({ version, encrypted })
  }

  private parseVersionedEncrypted(versionedEncryptedString: string): Aes256GcmEncrypted<BufferEncoding> {
    const { version, encrypted } = JSON.parse(versionedEncryptedString)
    if (+version !== User.DEFAULT_ENCRYPTION_VERSION) {
      throw Error(`Not supported encryption version: ${version}`)
    }

    return encrypted
  }
}
