import { Unencrypted } from '@standardnotes/sncrypto-common'

/**
 * Turns `unencrypted` into a `buffer` with `encoding`.
 * @param unencrypted
 */
export function getBufferWithEncoding(unencrypted: Unencrypted<BufferEncoding>): {
  buffer: Buffer
  encoding: BufferEncoding
} {
  if (typeof unencrypted === 'string') {
    const encoding: BufferEncoding = 'utf-8'
    const buffer = Buffer.from(unencrypted, encoding)
    return { buffer, encoding }
  }

  const { string, encoding } = unencrypted
  const buffer = Buffer.from(string, encoding)
  return { buffer, encoding }
}
