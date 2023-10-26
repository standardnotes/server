import 'reflect-metadata'
import { CrypterInterface } from '../Encryption/CrypterInterface'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { Setting } from './Setting'

import { SettingCrypter } from './SettingCrypter'
import { SubscriptionSetting } from './SubscriptionSetting'
import { SettingName } from '@standardnotes/settings'
import { Timestamps, Uuid } from '@standardnotes/domain-core'

describe('SettingCrypter', () => {
  let userRepository: UserRepositoryInterface
  let crypter: CrypterInterface
  let user: User

  const createDecrypter = () => new SettingCrypter(userRepository, crypter)

  beforeEach(() => {
    crypter = {} as jest.Mocked<CrypterInterface>
    crypter.decryptForUser = jest.fn().mockReturnValue('decrypted')

    user = {
      uuid: '4-5-6',
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)
  })

  describe('setting', () => {
    it('should encrypt a string value', async () => {
      const string = 'decrypted'

      crypter.encryptForUser = jest.fn().mockReturnValue('encrypted')

      const encrypted = await createDecrypter().encryptValue(
        string,
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )

      expect(encrypted).toEqual('encrypted')
    })

    it('should return null when trying to encrypt a null value', async () => {
      const encrypted = await createDecrypter().encryptValue(
        null,
        Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      )

      expect(encrypted).toBeNull()
    })

    it('should throw error when encrypting and user is not found', async () => {
      userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

      let caughtError = null
      try {
        await createDecrypter().encryptValue('test', Uuid.create('00000000-0000-0000-0000-000000000000').getValue())
      } catch (error) {
        caughtError = error
      }

      expect(caughtError).not.toBeNull()
    })

    it('should decrypt an encrypted value of a setting', async () => {
      const setting = Setting.create({
        name: SettingName.NAMES.ListedAuthorSecrets,
        value: 'encrypted',
        serverEncryptionVersion: EncryptionVersion.Default,
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sensitive: false,
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      expect(await createDecrypter().decryptSettingValue(setting, '00000000-0000-0000-0000-000000000000')).toEqual(
        'decrypted',
      )
    })

    it('should return null if the setting value is null', async () => {
      const setting = Setting.create({
        name: SettingName.NAMES.ListedAuthorSecrets,
        value: null,
        serverEncryptionVersion: EncryptionVersion.Default,
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sensitive: false,
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      expect(await createDecrypter().decryptSettingValue(setting, '00000000-0000-0000-0000-000000000000')).toBeNull()
    })

    it('should return unencrypted value if the setting value is unencrypted', async () => {
      const setting = Setting.create({
        name: SettingName.NAMES.ListedAuthorSecrets,
        value: 'test',
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sensitive: false,
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      expect(await createDecrypter().decryptSettingValue(setting, '00000000-0000-0000-0000-000000000000')).toEqual(
        'test',
      )
    })

    it('should throw if the user could not be found', async () => {
      const setting = Setting.create({
        name: SettingName.NAMES.ListedAuthorSecrets,
        value: 'encrypted',
        serverEncryptionVersion: EncryptionVersion.Default,
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sensitive: false,
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()
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
      const setting = Setting.create({
        name: SettingName.NAMES.ListedAuthorSecrets,
        value: 'encrypted',
        serverEncryptionVersion: EncryptionVersion.Default,
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        sensitive: false,
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      let caughtError = null
      try {
        await createDecrypter().decryptSettingValue(setting, 'invalid')
      } catch (error) {
        caughtError = error
      }

      expect(caughtError).not.toBeNull()
    })
  })

  describe('subscription setting', () => {
    it('should decrypt an encrypted value of a setting', async () => {
      const setting = SubscriptionSetting.create({
        name: SettingName.NAMES.ExtensionKey,
        value: 'encrypted',
        sensitive: true,
        serverEncryptionVersion: EncryptionVersion.Default,
        userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      expect(
        await createDecrypter().decryptSubscriptionSettingValue(setting, '00000000-0000-0000-0000-000000000000'),
      ).toEqual('decrypted')
    })

    it('should return null if the setting value is null', async () => {
      const setting = SubscriptionSetting.create({
        name: SettingName.NAMES.ExtensionKey,
        value: null,
        sensitive: true,
        serverEncryptionVersion: EncryptionVersion.Default,
        userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      expect(
        await createDecrypter().decryptSubscriptionSettingValue(setting, '00000000-0000-0000-0000-000000000000'),
      ).toBeNull()
    })

    it('should return unencrypted value if the setting value is unencrypted', async () => {
      const setting = SubscriptionSetting.create({
        name: SettingName.NAMES.ExtensionKey,
        value: 'test',
        sensitive: true,
        serverEncryptionVersion: EncryptionVersion.Unencrypted,
        userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      expect(
        await createDecrypter().decryptSubscriptionSettingValue(setting, '00000000-0000-0000-0000-000000000000'),
      ).toEqual('test')
    })

    it('should throw if the user could not be found', async () => {
      const setting = SubscriptionSetting.create({
        name: SettingName.NAMES.ExtensionKey,
        value: 'encrypted',
        sensitive: true,
        serverEncryptionVersion: EncryptionVersion.Default,
        userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()
      userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

      let caughtError = null
      try {
        await createDecrypter().decryptSubscriptionSettingValue(setting, '00000000-0000-0000-0000-000000000000')
      } catch (error) {
        caughtError = error
      }

      expect(caughtError).not.toBeNull()
    })

    it('should throw if the user uuid is invalid', async () => {
      const setting = SubscriptionSetting.create({
        name: SettingName.NAMES.ExtensionKey,
        value: 'encrypted',
        sensitive: true,
        serverEncryptionVersion: EncryptionVersion.Default,
        userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123, 123).getValue(),
      }).getValue()

      let caughtError = null
      try {
        await createDecrypter().decryptSubscriptionSettingValue(setting, 'invalid')
      } catch (error) {
        caughtError = error
      }

      expect(caughtError).not.toBeNull()
    })
  })
})
