import 'reflect-metadata'

import { RoleName, SubscriptionName } from '@standardnotes/common'
import { SubscriptionReactivatedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SubscriptionReactivatedEventHandler } from './SubscriptionReactivatedEventHandler'
import { AnalyticsStoreInterface, Period } from '@standardnotes/analytics'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

describe('SubscriptionReactivatedEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let logger: Logger
  let user: User
  let event: SubscriptionReactivatedEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface

  const createHandler = () =>
    new SubscriptionReactivatedEventHandler(userRepository, analyticsStore, getUserAnalyticsId, logger)

  beforeEach(() => {
    user = {
      uuid: '123',
      email: 'test@test.com',
      roles: Promise.resolve([
        {
          name: RoleName.ProUser,
        },
      ]),
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)
    userRepository.save = jest.fn().mockReturnValue(user)

    event = {} as jest.Mocked<SubscriptionReactivatedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      previousSubscriptionId: 1,
      currentSubscriptionId: 2,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.PlusPlan,
      subscriptionExpiresAt: 5,
      discountCode: 'exit-20',
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
  })

  it('should mark subscription reactivated activity for analytics', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalledWith(['subscription-reactivated'], 3, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  })

  it('should not do anything if no user is found for specified email', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(analyticsStore.markActivity).not.toHaveBeenCalled()
  })
})
