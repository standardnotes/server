import 'reflect-metadata'

import { PaymentSuccessEvent } from '@standardnotes/domain-events'
import { AnalyticsStoreInterface, StatisticsStoreInterface } from '@standardnotes/analytics'

import { PaymentSuccessEventHandler } from './PaymentSuccessEventHandler'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { User } from '../User/User'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

describe('PaymentSuccessEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let event: PaymentSuccessEvent
  let user: User
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface

  const createHandler = () =>
    new PaymentSuccessEventHandler(userRepository, getUserAnalyticsId, analyticsStore, statisticsStore)

  beforeEach(() => {
    user = {} as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByEmail = jest.fn().mockReturnValue(user)

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.incrementMeasure = jest.fn()

    event = {} as jest.Mocked<PaymentSuccessEvent>
    event.payload = {
      userEmail: 'test@test.com',
      amount: 12.45,
    }
  })

  it('should mark payment failed for analytics', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalled()
    expect(statisticsStore.incrementMeasure).toHaveBeenCalled()
  })

  it('should not mark payment failed for analytics if user is not found', async () => {
    userRepository.findOneByEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(analyticsStore.markActivity).not.toHaveBeenCalled()
  })
})
