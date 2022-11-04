import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { StatisticsMeasure } from '../Statistics/StatisticsMeasure'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    const { analyticsId } = await this.getUserAnalyticsId.execute({ userUuid: event.payload.userUuid })
    await this.analyticsStore.markActivity([AnalyticsActivity.DeleteAccount], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    const registrationLength = this.timer.getTimestampInMicroseconds() - event.payload.userCreatedAtTimestamp
    await this.statisticsStore.incrementMeasure(StatisticsMeasure.RegistrationLength, registrationLength, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  }
}
