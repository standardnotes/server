import { CryptoNode } from './CryptoNode'

describe('CryptoNode', function () {
  const crypto = new CryptoNode()

  it('aes gcm', async function () {
    const iv = await crypto.generateRandomKey(128)
    const key = await crypto.generateRandomKey(256)
    const unencrypted = 'hello world 🌍'
    const encrypted = await crypto.aes256GcmEncrypt({ unencrypted, iv, key })
    const decrypted = await crypto.aes256GcmDecrypt(encrypted, key)
    expect(decrypted).toEqual(unencrypted)
  })

  // from https://github.com/xorbit/node-aes-gcm/blob/588f9066a217335acc56ab45559d2b46edc9fa83/test/test.js#L342
  it('aes gcm NIST Test Case 15', async () => {
    const key = 'feffe9928665731c6d6a8f9467308308' + 'feffe9928665731c6d6a8f9467308308'
    const iv = 'cafebabefacedbaddecaf888'
    const string =
      'd9313225f88406e5a55909c5aff5269a' +
      '86a7a9531534f7da2e4c303d8a318a72' +
      '1c3c0c95956809532fcf0e2449a6b525' +
      'b16aedf5aa0de657ba637b391aafd255'
    const aad = ''
    const desiredCiphertext = Buffer.from(
      '522dc1f099567d07f47f37a32a84427d' +
        '643a8cdcbfe5c0c97598a2bd2555d1aa' +
        '8cb08e48590dbb3da7b08b1056828838' +
        'c5f61e6393ba7a0abcc9f662898015ad',
      'hex',
    ).toString('base64')
    const desiredTag = 'b094dac5d93471bdec1a502270e3cc6c'

    const encrypted = await crypto.aes256GcmEncrypt({
      unencrypted: { string, encoding: 'hex' },
      iv,
      key,
      aad,
    })

    expect(encrypted.ciphertext).toEqual(desiredCiphertext)
    expect(encrypted.tag).toEqual(desiredTag)
    expect(encrypted.iv).toEqual(iv)

    const decrypted = await crypto.aes256GcmDecrypt(encrypted, key)

    expect(decrypted).toEqual(string)
  })

  // from https://github.com/standardnotes/auth/blob/d5585b3ad0a27f58fb413ff2d85699d82b2e9b65/src/Domain/Encryption/Crypter.spec.ts#L32
  it('should encrypt and decrypt data with an expected output', async () => {
    const keys = [
      '00000000000000000000000000000000' + '00000000000000000000000000000000',
      '00000000000000000000000000000000' + '00000000000000000000000000000000',
      'feffe9928665731c6d6a8f9467308308' + 'feffe9928665731c6d6a8f9467308308',
      'feffe9928665731c6d6a8f9467308308' + 'feffe9928665731c6d6a8f9467308308',
      'feffe9928665731c6d6a8f9467308308' + 'feffe9928665731c6d6a8f9467308308',
      'feffe9928665731c6d6a8f9467308308' + 'feffe9928665731c6d6a8f9467308308',
    ]

    const ivs = [
      '000000000000000000000000',
      '000000000000000000000000',
      'cafebabefacedbaddecaf888',
      'cafebabefacedbaddecaf888',
      'cafebabefacedbad',
      '9313225df88406e555909c5aff5269aa' +
        '6a7a9538534f7da1e4c303d2a318a728' +
        'c3c0c95156809539fcf0e2429a6b5254' +
        '16aedbf5a0de6a57a637b39b',
    ]

    const inputs = [
      '',
      '00000000000000000000000000000000',
      'd9313225f88406e5a55909c5aff5269a' +
        '86a7a9531534f7da2e4c303d8a318a72' +
        '1c3c0c95956809532fcf0e2449a6b525' +
        'b16aedf5aa0de657ba637b391aafd255',
      'd9313225f88406e5a55909c5aff5269a' +
        '86a7a9531534f7da2e4c303d8a318a72' +
        '1c3c0c95956809532fcf0e2449a6b525' +
        'b16aedf5aa0de657ba637b39',
      'd9313225f88406e5a55909c5aff5269a' +
        '86a7a9531534f7da2e4c303d8a318a72' +
        '1c3c0c95956809532fcf0e2449a6b525' +
        'b16aedf5aa0de657ba637b39',
      'd9313225f88406e5a55909c5aff5269a' +
        '86a7a9531534f7da2e4c303d8a318a72' +
        '1c3c0c95956809532fcf0e2449a6b525' +
        'b16aedf5aa0de657ba637b39',
    ]

    const outputs = [
      '',
      'cea7403d4d606b6e074ec5d3baf39d18',
      '522dc1f099567d07f47f37a32a84427d' +
        '643a8cdcbfe5c0c97598a2bd2555d1aa' +
        '8cb08e48590dbb3da7b08b1056828838' +
        'c5f61e6393ba7a0abcc9f662898015ad',
      '522dc1f099567d07f47f37a32a84427d' +
        '643a8cdcbfe5c0c97598a2bd2555d1aa' +
        '8cb08e48590dbb3da7b08b1056828838' +
        'c5f61e6393ba7a0abcc9f662',
      'c3762df1ca787d32ae47c13bf19844cb' +
        'af1ae14d0b976afac52ff7d79bba9de0' +
        'feb582d33934a4f0954cc2363bc73f78' +
        '62ac430e64abe499f47c9b1f',
      '5a8def2f0c9e53f1f75d7853659e2a20' +
        'eeb2b22aafde6419a058ab4f6f746bf4' +
        '0fc0c3b780f244452da3ebf1c5d82cde' +
        'a2418997200ef82e44ae7e3f',
    ]

    const aads = [
      '',
      '',
      '',
      'feedfacedeadbeeffeedfacedeadbeef' + 'abaddad2',
      'feedfacedeadbeeffeedfacedeadbeef' + 'abaddad2',
      'feedfacedeadbeeffeedfacedeadbeef' + 'abaddad2',
    ]

    const tags = [
      '530f8afbc74536b9a963b4f1c4cb738b',
      'd0d1c8a799996bf0265b98b5d48ab919',
      'b094dac5d93471bdec1a502270e3cc6c',
      '76fc6ece0f4e1768cddf8853bb2d551b',
      '3a337dbf46a792c45e454913fe2ea8f2',
      'a44a8266ee1c8eb0c8b5d4cf5ae9f19a',
    ]

    for (let i = 0; i < keys.length; i++) {
      const string = inputs[i]
      const aad = aads[i]
      const iv = ivs[i]
      const key = keys[i]

      const desiredTag = tags[i]
      const desiredCiphertext = Buffer.from(outputs[i], 'hex').toString('base64')

      const encrypted = await crypto.aes256GcmEncrypt({
        unencrypted: { string, encoding: 'hex' },
        iv,
        key,
        aad,
      })

      expect(encrypted.ciphertext).toEqual(desiredCiphertext)
      expect(encrypted.tag).toEqual(desiredTag)
      expect(encrypted.iv).toEqual(iv)

      const decrypted = await crypto.aes256GcmDecrypt(encrypted, key)

      expect(decrypted).toEqual(string)
    }
  })

  it('should encrypt data with SHA256', () => {
    expect(crypto.sha256('eSyM3G8TkyzaCxDlQwXo0X7nkdrRkjEHN3TREmW7iQc4sKVibWj4pyQYZLacKAee')).toEqual(
      '97e65d4c20152373cb0f787d73f480c6890076fec1753098768f60c93f8ef63a',
    )
  })

  it('should base64 encode a utf8 string', () => {
    expect(crypto.base64Encode('Hello World')).toEqual('SGVsbG8gV29ybGQ=')
  })

  it('should base64 encode a utf8 string with url safe option', () => {
    expect(crypto.base64URLEncode('Hello World')).toEqual('SGVsbG8gV29ybGQ')
  })

  it('should base64 decode a utf8 string', () => {
    expect(crypto.base64Decode('SGVsbG8gV29ybGQ=')).toEqual('Hello World')
  })
})
