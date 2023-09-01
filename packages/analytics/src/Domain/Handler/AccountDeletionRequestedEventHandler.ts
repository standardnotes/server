import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable, optional } from 'inversify'
import { Mixpanel } from 'mixpanel'

import TYPES from '../../Bootstrap/Types'
import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../Analytics/AnalyticsStoreInterface'
import { AnalyticsEntityRepositoryInterface } from '../Entity/AnalyticsEntityRepositoryInterface'
import { StatisticMeasureName } from '../Statistics/StatisticMeasureName'
import { StatisticsStoreInterface } from '../Statistics/StatisticsStoreInterface'
import { Period } from '../Time/Period'

@injectable()
export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.AnalyticsEntityRepository) private analyticsEntityRepository: AnalyticsEntityRepositoryInterface,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.MixpanelClient) @optional() private mixpanelClient: Mixpanel | null,
  ) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    const analyticsEntity = await this.analyticsEntityRepository.findOneByUserUuid(event.payload.userUuid)

    if (analyticsEntity === null) {
      return
    }

    await this.analyticsStore.markActivity([AnalyticsActivity.DeleteAccount], analyticsEntity.id, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    const registrationLength = this.timer.getTimestampInMicroseconds() - event.payload.userCreatedAtTimestamp
    await this.statisticsStore.incrementMeasure(StatisticMeasureName.NAMES.RegistrationLength, registrationLength, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    if (this.mixpanelClient !== null) {
      this.mixpanelClient.track(event.type, {
        distinct_id: analyticsEntity.id.toString(),
        user_created_at: this.timer.convertMicrosecondsToDate(event.payload.userCreatedAtTimestamp),
      })
    }

    await this.analyticsEntityRepository.remove(analyticsEntity)
  }
}
