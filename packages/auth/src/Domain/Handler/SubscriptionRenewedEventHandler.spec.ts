import 'reflect-metadata'

import { RoleName, SubscriptionName } from '@standardnotes/common'
import { SubscriptionRenewedEvent } from '@standardnotes/domain-events'
import * as dayjs from 'dayjs'
import { Logger } from 'winston'

import { SubscriptionRenewedEventHandler } from './SubscriptionRenewedEventHandler'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { User } from '../User/User'
import { UserSubscription } from '../Subscription/UserSubscription'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { RoleServiceInterface } from '../Role/RoleServiceInterface'

describe('SubscriptionRenewedEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let offlineUserSubscription: OfflineUserSubscription
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let roleService: RoleServiceInterface
  let logger: Logger
  let user: User
  let subscription: UserSubscription
  let event: SubscriptionRenewedEvent
  let subscriptionExpiresAt: number
  let timestamp: number

  const createHandler = () =>
    new SubscriptionRenewedEventHandler(
      userRepository,
      userSubscriptionRepository,
      offlineUserSubscriptionRepository,
      roleService,
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
    subscription = {} as jest.Mocked<UserSubscription>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)
    userRepository.save = jest.fn().mockReturnValue(user)

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.updateEndsAt = jest.fn()
    userSubscriptionRepository.save = jest.fn().mockReturnValue(subscription)
    userSubscriptionRepository.findBySubscriptionId = jest
      .fn()
      .mockReturnValue([{ user: Promise.resolve(user) } as jest.Mocked<UserSubscription>])

    offlineUserSubscription = {} as jest.Mocked<OfflineUserSubscription>

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.findOneBySubscriptionId = jest.fn().mockReturnValue(offlineUserSubscription)
    offlineUserSubscriptionRepository.save = jest.fn().mockReturnValue(offlineUserSubscription)

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.addUserRole = jest.fn()
    roleService.setOfflineUserRole = jest.fn()

    timestamp = dayjs.utc().valueOf()
    subscriptionExpiresAt = dayjs.utc().valueOf() + 365 * 1000

    event = {} as jest.Mocked<SubscriptionRenewedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.ProPlan,
      subscriptionExpiresAt,
      timestamp,
      offline: false,
    }

    logger = {} as jest.Mocked<Logger>
    logger.warn = jest.fn()
  })

  it('should update subscription ends at', async () => {
    await createHandler().handle(event)

    expect(userSubscriptionRepository.updateEndsAt).toHaveBeenCalledWith(1, subscriptionExpiresAt, timestamp)
  })

  it('should update offline subscription ends at', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(offlineUserSubscriptionRepository.save).toHaveBeenCalledWith(offlineUserSubscription)
  })

  it('should update the user role', async () => {
    await createHandler().handle(event)

    expect(userRepository.findOneByEmail).toHaveBeenCalledWith('test@test.com')
    expect(roleService.addUserRole).toHaveBeenCalledWith(user, SubscriptionName.ProPlan)
  })

  it('should update the offline user role', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(roleService.setOfflineUserRole).toHaveBeenCalledWith(offlineUserSubscription)
  })

  it('should not do anything if no user is found for specified email', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(roleService.addUserRole).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
  })

  it('should not do anything if no offline subscription is found for specified id', async () => {
    event.payload.offline = true

    offlineUserSubscriptionRepository.findOneBySubscriptionId = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(roleService.addUserRole).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.save).not.toHaveBeenCalled()
  })
})
