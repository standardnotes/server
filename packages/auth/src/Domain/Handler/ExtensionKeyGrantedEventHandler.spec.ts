import 'reflect-metadata'

import { ExtensionKeyGrantedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import * as dayjs from 'dayjs'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { ExtensionKeyGrantedEventHandler } from './ExtensionKeyGrantedEventHandler'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { OfflineSettingServiceInterface } from '../Setting/OfflineSettingServiceInterface'
import { ContentDecoderInterface, SubscriptionName } from '@standardnotes/common'

describe('ExtensionKeyGrantedEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let logger: Logger
  let user: User
  let event: ExtensionKeyGrantedEvent
  let settingService: SettingServiceInterface
  let offlineSettingService: OfflineSettingServiceInterface
  let contentDecoder: ContentDecoderInterface
  let timestamp: number

  const createHandler = () =>
    new ExtensionKeyGrantedEventHandler(userRepository, settingService, offlineSettingService, contentDecoder, logger)

  beforeEach(() => {
    user = {
      uuid: '123',
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.createOrReplace = jest.fn()

    offlineSettingService = {} as jest.Mocked<OfflineSettingServiceInterface>
    offlineSettingService.createOrUpdate = jest.fn()

    timestamp = dayjs.utc().valueOf()

    event = {} as jest.Mocked<ExtensionKeyGrantedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userEmail: 'test@test.com',
      extensionKey: 'abc123',
      offline: false,
      offlineFeaturesToken: 'test',
      subscriptionName: SubscriptionName.ProPlan,
      origin: 'update-subscription',
      timestamp,
      payAmount: 1000,
      billingEveryNMonths: 1,
      activeUntil: new Date(10).toString(),
    }

    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn().mockReturnValue({
      featuresUrl: 'http://features-url',
      extensionKey: 'key',
    })

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
  })

  it('should add extension key as an user offline features token for offline user setting', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(offlineSettingService.createOrUpdate).toHaveBeenCalledWith({
      email: 'test@test.com',
      name: 'FEATURES_TOKEN',
      value: 'key',
    })
  })

  it('should add extension key as an user offline features token if not possible to decode', async () => {
    event.payload.offline = true

    contentDecoder.decode = jest.fn().mockReturnValue({})

    await createHandler().handle(event)

    expect(offlineSettingService.createOrUpdate).not.toHaveBeenCalled()
  })

  it('should add extension key as user setting', async () => {
    await createHandler().handle(event)

    expect(settingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'EXTENSION_KEY',
        serverEncryptionVersion: 1,
        unencryptedValue: 'abc123',
        sensitive: true,
      },
      user: {
        uuid: '123',
      },
    })
  })

  it('should not do anything if no user is found for specified email', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(settingService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should not do anything if user email is invalid', async () => {
    event.payload.userEmail = ''

    await createHandler().handle(event)

    expect(settingService.createOrReplace).not.toHaveBeenCalled()
  })
})
