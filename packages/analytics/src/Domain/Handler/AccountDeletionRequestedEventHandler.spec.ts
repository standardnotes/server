import 'reflect-metadata'

import { AccountDeletionRequestedEvent } from '@standardnotes/domain-events'
import { AccountDeletionRequestedEventHandler } from './AccountDeletionRequestedEventHandler'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { TimerInterface } from '@standardnotes/time'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'

describe('AccountDeletionRequestedEventHandler', () => {
  let event: AccountDeletionRequestedEvent
  let getUserAnalyticsId: GetUserAnalyticsId
  let analyticsStore: AnalyticsStoreInterface
  let statisticsStore: StatisticsStoreInterface
  let timer: TimerInterface

  const createHandler = () =>
    new AccountDeletionRequestedEventHandler(getUserAnalyticsId, analyticsStore, statisticsStore, timer)

  beforeEach(() => {
    event = {} as jest.Mocked<AccountDeletionRequestedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      userUuid: '1-2-3',
      userCreatedAtTimestamp: 1,
      regularSubscriptionUuid: '2-3-4',
    }

    getUserAnalyticsId = {} as jest.Mocked<GetUserAnalyticsId>
    getUserAnalyticsId.execute = jest.fn().mockReturnValue({ analyticsId: 3 })

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
  })
})
