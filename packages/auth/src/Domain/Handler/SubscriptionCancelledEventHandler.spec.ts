import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { SubscriptionCancelledEvent } from '@standardnotes/domain-events'

import * as dayjs from 'dayjs'

import { SubscriptionCancelledEventHandler } from './SubscriptionCancelledEventHandler'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'

describe('SubscriptionCancelledEventHandler', () => {
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let event: SubscriptionCancelledEvent
  let timestamp: number

  const createHandler = () =>
    new SubscriptionCancelledEventHandler(userSubscriptionRepository, offlineUserSubscriptionRepository)

  beforeEach(() => {
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
      replaced: false,
      subscriptionCreatedAt: 1,
      subscriptionEndsAt: 2,
      subscriptionUpdatedAt: 2,
      lastPayedAt: 1,
    }
  })

  it('should update subscription cancelled', async () => {
    event.payload.timestamp = 1642395451516000
    await createHandler().handle(event)

    expect(userSubscriptionRepository.updateCancelled).toHaveBeenCalledWith(1, true, 1642395451516000)
  })

  it('should update offline subscription cancelled', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(offlineUserSubscriptionRepository.updateCancelled).toHaveBeenCalledWith(1, true, timestamp)
  })
})
