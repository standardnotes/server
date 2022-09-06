import {
  AnalyticsActivity,
  AnalyticsStoreInterface,
  Period,
  StatisticsMeasure,
  StatisticsStoreInterface,
} from '@standardnotes/analytics'
import { DomainEventHandlerInterface, PaymentSuccessEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

@injectable()
export class PaymentSuccessEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
  ) {}

  async handle(event: PaymentSuccessEvent): Promise<void> {
    const user = await this.userRepository.findOneByEmail(event.payload.userEmail)
    if (user === null) {
      return
    }

    const { analyticsId } = await this.getUserAnalyticsId.execute({ userUuid: user.uuid })
    await this.analyticsStore.markActivity([AnalyticsActivity.PaymentSuccess], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    await this.statisticsStore.incrementMeasure(StatisticsMeasure.Income, event.payload.amount, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])
  }
}
