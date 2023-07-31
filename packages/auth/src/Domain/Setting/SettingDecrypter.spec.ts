import 'reflect-metadata'
import { CrypterInterface } from '../Encryption/CrypterInterface'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { Setting } from './Setting'

import { SettingDecrypter } from './SettingDecrypter'

describe('SettingDecrypter', () => {
  let userRepository: UserRepositoryInterface
  let crypter: CrypterInterface
  let user: User

  const createDecrypter = () => new SettingDecrypter(userRepository, crypter)

  beforeEach(() => {
    crypter = {} as jest.Mocked<CrypterInterface>
    crypter.decryptForUser = jest.fn().mockReturnValue('decrypted')

    user = {
      uuid: '4-5-6',
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)
  })

  it('should decrypt an encrypted value of a setting', async () => {
    const setting = {
      value: 'encrypted',
      serverEncryptionVersion: EncryptionVersion.Default,
    } as jest.Mocked<Setting>

    expect(await createDecrypter().decryptSettingValue(setting, '00000000-0000-0000-0000-000000000000')).toEqual(
      'decrypted',
    )
  })

  it('should return null if the setting value is null', async () => {
    const setting = {
      value: null,
      serverEncryptionVersion: EncryptionVersion.Default,
    } as jest.Mocked<Setting>

    expect(await createDecrypter().decryptSettingValue(setting, '00000000-0000-0000-0000-000000000000')).toBeNull()
  })

  it('should return unencrypted value if the setting value is unencrypted', async () => {
    const setting = {
      value: 'test',
      serverEncryptionVersion: EncryptionVersion.Unencrypted,
    } as jest.Mocked<Setting>

    expect(await createDecrypter().decryptSettingValue(setting, '00000000-0000-0000-0000-000000000000')).toEqual('test')
  })

  it('should throw if the user could not be found', async () => {
    const setting = {
      value: 'encrypted',
      serverEncryptionVersion: EncryptionVersion.Default,
    } as jest.Mocked<Setting>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    let caughtError = null
    try {
      await createDecrypter().decryptSettingValue(setting, '00000000-0000-0000-0000-000000000000')
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).not.toBeNull()
  })

  it('should throw if the user uuid is invalid', async () => {
    const setting = {
      value: 'encrypted',
      serverEncryptionVersion: EncryptionVersion.Default,
    } as jest.Mocked<Setting>

    let caughtError = null
    try {
      await createDecrypter().decryptSettingValue(setting, 'invalid')
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).not.toBeNull()
  })
})
