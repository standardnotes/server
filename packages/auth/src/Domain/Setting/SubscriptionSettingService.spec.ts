import 'reflect-metadata'

import { SettingName } from '@standardnotes/domain-core'
import { Logger } from 'winston'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'

import { SubscriptionSettingService } from './SubscriptionSettingService'
import { SettingDecrypterInterface } from './SettingDecrypterInterface'
import { SubscriptionSettingRepositoryInterface } from './SubscriptionSettingRepositoryInterface'
import { SubscriptionSetting } from './SubscriptionSetting'
import { UserSubscription } from '../Subscription/UserSubscription'
import { SubscriptionName } from '@standardnotes/common'
import { User } from '../User/User'
import { SettingFactoryInterface } from './SettingFactoryInterface'
import { SubscriptionSettingsAssociationServiceInterface } from './SubscriptionSettingsAssociationServiceInterface'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'

describe('SubscriptionSettingService', () => {
  let setting: SubscriptionSetting
  let user: User
  let userSubscription: UserSubscription
  let factory: SettingFactoryInterface
  let subscriptionSettingRepository: SubscriptionSettingRepositoryInterface
  let subscriptionSettingsAssociationService: SubscriptionSettingsAssociationServiceInterface
  let settingDecrypter: SettingDecrypterInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let logger: Logger

  const createService = () =>
    new SubscriptionSettingService(
      factory,
      subscriptionSettingRepository,
      subscriptionSettingsAssociationService,
      settingDecrypter,
      userSubscriptionRepository,
      logger,
    )

  beforeEach(() => {
    user = {} as jest.Mocked<User>

    userSubscription = {
      uuid: '1-2-3',
      user: Promise.resolve(user),
    } as jest.Mocked<UserSubscription>

    setting = {} as jest.Mocked<SubscriptionSetting>

    factory = {} as jest.Mocked<SettingFactoryInterface>
    factory.createSubscriptionSetting = jest.fn().mockReturnValue(setting)
    factory.createSubscriptionSettingReplacement = jest.fn().mockReturnValue(setting)

    subscriptionSettingRepository = {} as jest.Mocked<SubscriptionSettingRepositoryInterface>
    subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid = jest.fn().mockReturnValue(null)
    subscriptionSettingRepository.save = jest.fn().mockImplementation((setting) => setting)

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([
      {
        uuid: 's-1-2-3',
      } as jest.Mocked<UserSubscription>,
      {
        uuid: 's-2-3-4',
      } as jest.Mocked<UserSubscription>,
    ])

    subscriptionSettingsAssociationService = {} as jest.Mocked<SubscriptionSettingsAssociationServiceInterface>
    subscriptionSettingsAssociationService.getDefaultSettingsAndValuesForSubscriptionName = jest.fn().mockReturnValue(
      new Map([
        [
          SettingName.NAMES.FileUploadBytesUsed,
          {
            value: '0',
            sensitive: 0,
            serverEncryptionVersion: EncryptionVersion.Unencrypted,
            replaceable: true,
          },
        ],
      ]),
    )

    settingDecrypter = {} as jest.Mocked<SettingDecrypterInterface>
    settingDecrypter.decryptSettingValue = jest.fn().mockReturnValue('decrypted')

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  it('should create default settings for a subscription', async () => {
    await createService().applyDefaultSubscriptionSettingsForSubscription(
      userSubscription,
      SubscriptionName.PlusPlan,
      '1-2-3',
    )

    expect(subscriptionSettingRepository.save).toHaveBeenCalledWith(setting)
  })

  it('should reassign existing default settings for a subscription if it is not replaceable', async () => {
    subscriptionSettingsAssociationService.getDefaultSettingsAndValuesForSubscriptionName = jest.fn().mockReturnValue(
      new Map([
        [
          SettingName.NAMES.FileUploadBytesUsed,
          {
            value: '0',
            sensitive: 0,
            serverEncryptionVersion: EncryptionVersion.Unencrypted,
            replaceable: false,
          },
        ],
      ]),
    )
    subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid = jest.fn().mockReturnValue(setting)

    await createService().applyDefaultSubscriptionSettingsForSubscription(
      userSubscription,
      SubscriptionName.PlusPlan,
      '1-2-3',
    )

    expect(subscriptionSettingRepository.save).toHaveBeenCalled()
  })

  it('should create default settings for a subscription if it is not replaceable and not existing', async () => {
    subscriptionSettingsAssociationService.getDefaultSettingsAndValuesForSubscriptionName = jest.fn().mockReturnValue(
      new Map([
        [
          SettingName.NAMES.FileUploadBytesUsed,
          {
            value: '0',
            sensitive: 0,
            serverEncryptionVersion: EncryptionVersion.Unencrypted,
            replaceable: false,
          },
        ],
      ]),
    )
    subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid = jest.fn().mockReturnValue(null)

    await createService().applyDefaultSubscriptionSettingsForSubscription(
      userSubscription,
      SubscriptionName.PlusPlan,
      '1-2-3',
    )

    expect(subscriptionSettingRepository.save).toHaveBeenCalledWith(setting)
  })

  it('should create default settings for a subscription if it is not replaceable and no previous subscription existed', async () => {
    subscriptionSettingsAssociationService.getDefaultSettingsAndValuesForSubscriptionName = jest.fn().mockReturnValue(
      new Map([
        [
          SettingName.NAMES.FileUploadBytesUsed,
          {
            value: '0',
            sensitive: 0,
            serverEncryptionVersion: EncryptionVersion.Unencrypted,
            replaceable: false,
          },
        ],
      ]),
    )
    subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid = jest.fn().mockReturnValue(null)
    userSubscriptionRepository.findByUserUuid = jest.fn().mockReturnValue([
      {
        uuid: '1-2-3',
      } as jest.Mocked<UserSubscription>,
    ])

    await createService().applyDefaultSubscriptionSettingsForSubscription(
      userSubscription,
      SubscriptionName.PlusPlan,
      '1-2-3',
    )

    expect(subscriptionSettingRepository.save).toHaveBeenCalledWith(setting)
  })

  it('should not create default settings for a subscription if subscription has no defaults', async () => {
    subscriptionSettingsAssociationService.getDefaultSettingsAndValuesForSubscriptionName = jest
      .fn()
      .mockReturnValue(undefined)

    await createService().applyDefaultSubscriptionSettingsForSubscription(
      userSubscription,
      SubscriptionName.PlusPlan,
      '1-2-3',
    )

    expect(subscriptionSettingRepository.save).not.toHaveBeenCalled()
  })

  it("should create setting if it doesn't exist", async () => {
    const result = await createService().createOrReplace({
      userSubscription,
      props: {
        name: 'name',
        unencryptedValue: 'value',
        serverEncryptionVersion: 1,
        sensitive: false,
      },
    })

    expect(result.status).toEqual('created')
  })

  it('should create setting with a given uuid if it does not exist', async () => {
    subscriptionSettingRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createService().createOrReplace({
      userSubscription,
      props: {
        uuid: '1-2-3',
        name: 'name',
        unencryptedValue: 'value',
        serverEncryptionVersion: 1,
        sensitive: false,
      },
    })

    expect(result.status).toEqual('created')
  })

  it('should replace setting if it does exist', async () => {
    subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid = jest.fn().mockReturnValue(setting)

    const result = await createService().createOrReplace({
      userSubscription,
      props: {
        ...setting,
        unencryptedValue: 'value',
        serverEncryptionVersion: 1,
      },
    })

    expect(result.status).toEqual('replaced')
  })

  it('should replace setting with a given uuid if it does exist', async () => {
    subscriptionSettingRepository.findOneByUuid = jest.fn().mockReturnValue(setting)

    const result = await createService().createOrReplace({
      userSubscription,
      props: {
        ...setting,
        uuid: '1-2-3',
        unencryptedValue: 'value',
        serverEncryptionVersion: 1,
      },
    })

    expect(result.status).toEqual('replaced')
  })

  it('should find and decrypt the value of a setting for user', async () => {
    setting = {
      value: 'encrypted',
      serverEncryptionVersion: EncryptionVersion.Default,
    } as jest.Mocked<SubscriptionSetting>

    subscriptionSettingRepository.findLastByNameAndUserSubscriptionUuid = jest.fn().mockReturnValue(setting)

    expect(
      await createService().findSubscriptionSettingWithDecryptedValue({
        userSubscriptionUuid: '2-3-4',
        userUuid: '1-2-3',
        subscriptionSettingName: 'test',
      }),
    ).toEqual({
      serverEncryptionVersion: 1,
      value: 'decrypted',
    })
  })
})
