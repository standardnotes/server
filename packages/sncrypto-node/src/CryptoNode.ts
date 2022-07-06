import {
  Aes256GcmEncrypted,
  Aes256GcmInput,
  HexString,
  CryptoAes256GcmInterface,
  CryptoSha256Interface,
  CryptoBase64Interface,
  Utf8String,
  Base64String,
} from '@standardnotes/sncrypto-common'
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

import { getBufferWithEncoding } from './Utils'

export class CryptoNode
  implements CryptoAes256GcmInterface<BufferEncoding>, CryptoSha256Interface, CryptoBase64Interface
{
  async aes256GcmEncrypt({
    unencrypted,
    iv,
    key,
    aad = '',
  }: Aes256GcmInput<BufferEncoding>): Promise<Aes256GcmEncrypted<BufferEncoding>> {
    const { buffer: dataBuffer, encoding } = getBufferWithEncoding(unencrypted)
    const ivBuffer = Buffer.from(iv, 'hex')
    const keyBuffer = Buffer.from(key, 'hex')
    const cipher = createCipheriv('aes-256-gcm', keyBuffer, ivBuffer)
    const aadBuffer = Buffer.from(aad, 'hex')
    cipher.setAAD(aadBuffer)

    const ciphertext = Buffer.concat([cipher.update(dataBuffer), cipher.final()]).toString('base64')

    const tag = cipher.getAuthTag().toString('hex')

    return { iv, tag, aad, ciphertext, encoding }
  }

  async aes256GcmDecrypt(encrypted: Aes256GcmEncrypted<BufferEncoding>, key: HexString): Promise<string> {
    const { iv, tag, ciphertext, encoding, aad } = encrypted

    const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
    decipher.setAuthTag(Buffer.from(tag, 'hex'))

    decipher.setAAD(Buffer.from(aad, 'hex'))

    const decrypted = Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()])

    return decrypted.toString(encoding)
  }

  async generateRandomKey(bits: number): Promise<HexString> {
    const bytes = bits / 8
    const buf = randomBytes(bytes)

    return buf.toString('hex')
  }

  sha256(text: Utf8String): HexString {
    const hash = createHash('sha256').update(text)

    return hash.digest('hex')
  }

  base64Encode(text: Utf8String): Base64String {
    const { buffer } = getBufferWithEncoding({ string: text, encoding: 'utf8' })

    return buffer.toString('base64')
  }

  base64URLEncode(text: Utf8String): Base64String {
    const { buffer } = getBufferWithEncoding({ string: text, encoding: 'utf8' })

    return buffer.toString('base64url')
  }

  base64Decode(base64String: Base64String): Utf8String {
    const { buffer } = getBufferWithEncoding({ string: base64String, encoding: 'base64' })

    return buffer.toString('utf8')
  }
}
