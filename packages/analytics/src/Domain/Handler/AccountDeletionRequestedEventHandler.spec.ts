import 'reflect-metadata'

import { AccountDeletionRequestedEvent } from '@standardnotes/domain-events'
import { AccountDeletionRequestedEventHandler } from './AccountDeletionRequestedEventHandler'
import { TimerInterface } from '@standardnotes/time'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'
import { AnalyticsEntityRepositoryInterface } from '../Entity/AnalyticsEntityRepositoryInterface'

describe('AccountDeletionRequestedEventHandler', () => {
  let event: AccountDeletionRequestedEvent
  let analyticsEntityRepository: AnalyticsEntityRepositoryInterface
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface
  let timer: TimerInterface

  const createHandler = () =>
    new AccountDeletionRequestedEventHandler(analyticsEntityRepository, analyticsStore, statisticsStore, timer)

  beforeEach(() => {
    event = {} as jest.Mocked<AccountDeletionRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      userCreatedAtTimestamp: 1,
      regularSubscriptionUuid: '2-3-4',
    }

    analyticsEntityRepository = {} as jest.Mocked<AnalyticsEntityRepositoryInterface>
    analyticsEntityRepository.findOneByUserUuid = jest.fn().mockReturnValue({ id: 3 })
    analyticsEntityRepository.remove = jest.fn()

    analyticsStore = {} as jest.Mocked<AnalyticsStoreInterface>
    analyticsStore.markActivity = jest.fn()

    statisticsStore = {} as jest.Mocked<StatisticsStoreInterface>
    statisticsStore.incrementMeasure = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)
  })

  it('should mark account deletion and registration length', async () => {
    await createHandler().handle(event)

    expect(analyticsStore.markActivity).toHaveBeenCalledWith(['DeleteAccount'], 3, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
    expect(statisticsStore.incrementMeasure).toHaveBeenCalledWith('registration-length', 122, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
    expect(analyticsEntityRepository.remove).toHaveBeenCalled()
  })

  it('should not mark anything if entity is not found', async () => {
    analyticsEntityRepository.findOneByUserUuid = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(analyticsStore.markActivity).not.toHaveBeenCalled()
    expect(statisticsStore.incrementMeasure).not.toHaveBeenCalled()
    expect(analyticsEntityRepository.remove).not.toHaveBeenCalled()
  })
})
