import 'reflect-metadata'

import { RoleName, SubscriptionName } from '@standardnotes/common'
import { SubscriptionReassignedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import * as dayjs from 'dayjs'

import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { SubscriptionReassignedEventHandler } from './SubscriptionReassignedEventHandler'
import { UserSubscription } from '../Subscription/UserSubscription'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { UserSubscriptionType } from '../Subscription/UserSubscriptionType'
import { SubscriptionSettingServiceInterface } from '../Setting/SubscriptionSettingServiceInterface'

describe('SubscriptionReassignedEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let roleService: RoleServiceInterface
  let logger: Logger
  let user: User
  let subscription: UserSubscription
  let event: SubscriptionReassignedEvent
  let subscriptionExpiresAt: number
  let timestamp: number
  let settingService: SettingServiceInterface
  let subscriptionSettingService: SubscriptionSettingServiceInterface

  const createHandler = () =>
    new SubscriptionReassignedEventHandler(
      userRepository,
      userSubscriptionRepository,
      roleService,
      settingService,
      subscriptionSettingService,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '123',
      email: 'test@test.com',
      roles: Promise.resolve([
        {
          name: RoleName.CoreUser,
        },
      ]),
    } as jest.Mocked<User>
    subscription = {
      subscriptionType: UserSubscriptionType.Regular,
    } as jest.Mocked<UserSubscription>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)
    userRepository.save = jest.fn().mockReturnValue(user)

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.save = jest.fn().mockReturnValue(subscription)

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addUserRole = jest.fn()

    subscriptionExpiresAt = timestamp + 365 * 1000

    event = {} as jest.Mocked<SubscriptionReassignedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      offline: false,
      extensionKey: 'abc123',
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.ProPlan,
      subscriptionExpiresAt,
      timestamp: dayjs.utc().valueOf(),
    }

    settingService = {} as jest.Mocked<SettingServiceInterface>
    settingService.createOrReplace = jest.fn()

    subscriptionSettingService = {} as jest.Mocked<SubscriptionSettingServiceInterface>
    subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
  })

  it('should update user default settings', async () => {
    await createHandler().handle(event)

    expect(subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription).toHaveBeenCalledWith(
      subscription,
      SubscriptionName.ProPlan,
    )
  })

  it('should update the user role', async () => {
    await createHandler().handle(event)

    expect(userRepository.findOneByEmail).toHaveBeenCalledWith('test@test.com')
    expect(roleService.addUserRole).toHaveBeenCalledWith(user, SubscriptionName.ProPlan)
  })

  it('should create subscription', async () => {
    await createHandler().handle(event)

    subscription.planName = SubscriptionName.ProPlan
    subscription.endsAt = subscriptionExpiresAt
    subscription.subscriptionId = 1
    subscription.user = Promise.resolve(user)

    expect(userRepository.findOneByEmail).toHaveBeenCalledWith('test@test.com')
    expect(userSubscriptionRepository.save).toHaveBeenCalledWith({
      ...subscription,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      cancelled: false,
    })
  })

  it('should create an extension key setting for the user', async () => {
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
        email: 'test@test.com',
        roles: Promise.resolve([
          {
            name: RoleName.CoreUser,
          },
        ]),
      },
    })
  })

  it('should not do anything if no user is found for specified email', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(roleService.addUserRole).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
  })
})
