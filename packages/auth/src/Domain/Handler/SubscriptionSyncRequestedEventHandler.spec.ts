import 'reflect-metadata'

import { ContentDecoderInterface, SubscriptionName } from '@standardnotes/common'
import { RoleName } from '@standardnotes/domain-core'
import { SubscriptionSyncRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import * as dayjs from 'dayjs'

import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { SubscriptionSyncRequestedEventHandler } from './SubscriptionSyncRequestedEventHandler'
import { UserSubscription } from '../Subscription/UserSubscription'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { OfflineSettingServiceInterface } from '../Setting/OfflineSettingServiceInterface'
import { UserSubscriptionType } from '../Subscription/UserSubscriptionType'
import { SubscriptionSettingServiceInterface } from '../Setting/SubscriptionSettingServiceInterface'

describe('SubscriptionSyncRequestedEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let offlineUserSubscription: OfflineUserSubscription
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let roleService: RoleServiceInterface
  let logger: Logger
  let user: User
  let subscription: UserSubscription
  let event: SubscriptionSyncRequestedEvent
  let subscriptionExpiresAt: number
  let settingService: SettingServiceInterface
  let subscriptionSettingService: SubscriptionSettingServiceInterface
  let timestamp: number
  let offlineSettingService: OfflineSettingServiceInterface
  let contentDecoder: ContentDecoderInterface

  const createHandler = () =>
    new SubscriptionSyncRequestedEventHandler(
      userRepository,
      userSubscriptionRepository,
      offlineUserSubscriptionRepository,
      roleService,
      settingService,
      subscriptionSettingService,
      offlineSettingService,
      contentDecoder,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '123',
      email: 'test@test.com',
      roles: Promise.resolve([
        {
          name: RoleName.NAMES.CoreUser,
        },
      ]),
    } as jest.Mocked<User>
    subscription = {
      subscriptionType: UserSubscriptionType.Regular,
    } as jest.Mocked<UserSubscription>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)
    userRepository.save = jest.fn().mockReturnValue(user)

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.save = jest.fn().mockReturnValue(subscription)
    userSubscriptionRepository.findBySubscriptionIdAndType = jest.fn().mockReturnValue([])

    offlineUserSubscription = {} as jest.Mocked<OfflineUserSubscription>

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.findOneBySubscriptionId = jest.fn().mockReturnValue(null)
    offlineUserSubscriptionRepository.save = jest.fn().mockReturnValue(offlineUserSubscription)

    offlineSettingService = {} as jest.Mocked<OfflineSettingServiceInterface>
    offlineSettingService.createOrUpdate = jest.fn()

    contentDecoder = {} as jest.Mocked<ContentDecoderInterface>
    contentDecoder.decode = jest.fn().mockReturnValue({
      featuresUrl: 'http://features-url',
      extensionKey: 'key',
    })

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addUserRole = jest.fn()
    roleService.setOfflineUserRole = jest.fn()

    subscriptionExpiresAt = timestamp + 365 * 1000

    event = {} as jest.Mocked<SubscriptionSyncRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.ProPlan,
      subscriptionExpiresAt,
      timestamp: dayjs.utc().valueOf(),
      offline: false,
      extensionKey: 'abc123',
      offlineFeaturesToken: 'test',
      canceled: false,
    }

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.createOrReplace = jest.fn()

    subscriptionSettingService = {} as jest.Mocked<SubscriptionSettingServiceInterface>
    subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
  })

  it('should update the user role', async () => {
    await createHandler().handle(event)

    expect(roleService.addUserRole).toHaveBeenCalledWith(user, SubscriptionName.ProPlan)
  })

  it('should update user default settings', async () => {
    await createHandler().handle(event)

    expect(subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription).toHaveBeenCalledWith(
      subscription,
      SubscriptionName.ProPlan,
      '123',
    )

    expect(settingService.createOrReplace).toHaveBeenCalledWith({
      props: {
        name: 'EXTENSION_KEY',
        serverEncryptionVersion: 1,
        unencryptedValue: 'abc123',
        sensitive: true,
      },
      user: {
        email: 'test@test.com',
        roles: Promise.resolve([
          {
            name: RoleName.NAMES.CoreUser,
          },
        ]),
        uuid: '123',
      },
    })
  })

  it('should update the offline user role', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(roleService.setOfflineUserRole).toHaveBeenCalledWith(offlineUserSubscription)
  })

  it('should not update the offline user features token if it is not possible to decode the extension key', async () => {
    event.payload.offline = true

    contentDecoder.decode = jest.fn().mockReturnValue({})

    await createHandler().handle(event)

    expect(settingService.createOrReplace).not.toHaveBeenCalled()
  })

  it('should create subscription', async () => {
    await createHandler().handle(event)

    subscription.planName = SubscriptionName.ProPlan
    subscription.endsAt = subscriptionExpiresAt
    subscription.subscriptionId = 1
    subscription.user = Promise.resolve(user)

    expect(userSubscriptionRepository.save).toHaveBeenCalledWith({
      ...subscription,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      cancelled: false,
    })
  })

  it('should update an existing subscription', async () => {
    userSubscriptionRepository.findBySubscriptionIdAndType = jest
      .fn()
      .mockReturnValue([{} as jest.Mocked<UserSubscription>])
    await createHandler().handle(event)

    subscription.planName = SubscriptionName.ProPlan
    subscription.endsAt = subscriptionExpiresAt
    subscription.subscriptionId = 1
    subscription.user = Promise.resolve(user)

    expect(userSubscriptionRepository.save).toHaveBeenCalledWith({
      ...subscription,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      cancelled: false,
    })
  })

  it('should create an offline subscription', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(offlineUserSubscriptionRepository.save).toHaveBeenCalledWith({
      endsAt: subscriptionExpiresAt,
      subscriptionId: 1,
      planName: 'PRO_PLAN',
      email: 'test@test.com',
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      cancelled: false,
    })
  })

  it('should update an offline subscription', async () => {
    offlineUserSubscriptionRepository.findOneBySubscriptionId = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<OfflineUserSubscription>)
    event.payload.offline = true

    await createHandler().handle(event)

    expect(offlineUserSubscriptionRepository.save).toHaveBeenCalledWith({
      endsAt: subscriptionExpiresAt,
      subscriptionId: 1,
      planName: 'PRO_PLAN',
      email: 'test@test.com',
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      cancelled: false,
    })
  })

  it('should not do anything if no user is found for specified email', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(roleService.addUserRole).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
  })

  it('should not do anything if username is invalid', async () => {
    event.payload.userEmail = '  '

    await createHandler().handle(event)

    expect(roleService.addUserRole).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
  })
})
