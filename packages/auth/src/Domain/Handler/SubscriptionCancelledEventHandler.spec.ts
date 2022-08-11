import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionCancelledEvent } from '@standardnotes/domain-events'

import * as dayjs from 'dayjs'

import { SubscriptionCancelledEventHandler } from './SubscriptionCancelledEventHandler'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { AnalyticsStoreInterface } from '@standardnotes/analytics'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { User } from '../User/User'

describe('SubscriptionCancelledEventHandler', () => {
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let event: SubscriptionCancelledEvent
  let userRepository: UserRepositoryInterface
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let timestamp: number

  const createHandler = () =>
    new SubscriptionCancelledEventHandler(
      userSubscriptionRepository,
      offlineUserSubscriptionRepository,
      userRepository,
      getUserAnalyticsId,
      analyticsStore,
    )

  beforeEach(() => {
    const user = { uuid: '1-2-3' } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.updateCancelled = jest.fn()

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.updateCancelled = jest.fn()

    timestamp = dayjs.utc().valueOf()

    event = {} as jest.Mocked<SubscriptionCancelledEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.ProPlan,
      timestamp,
      offline: false,
    }
  })

  it('should update subscription cancelled', async () => {
    await createHandler().handle(event)

    expect(userSubscriptionRepository.updateCancelled).toHaveBeenCalledWith(1, true, timestamp)
    expect(analyticsStore.markActivity).toHaveBeenCalled()
  })

  it('should update subscription cancelled - user not found', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(userSubscriptionRepository.updateCancelled).toHaveBeenCalledWith(1, true, timestamp)
    expect(analyticsStore.markActivity).not.toHaveBeenCalled()
  })

  it('should update offline subscription cancelled', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(offlineUserSubscriptionRepository.updateCancelled).toHaveBeenCalledWith(1, true, timestamp)
  })
})
