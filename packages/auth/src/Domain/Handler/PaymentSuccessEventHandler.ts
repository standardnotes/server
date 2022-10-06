import {
  AnalyticsActivity,
  AnalyticsStoreInterface,
  Period,
  StatisticsMeasure,
  StatisticsStoreInterface,
} from '@standardnotes/analytics'
import { PaymentType, SubscriptionBillingFrequency, SubscriptionName } from '@standardnotes/common'
import { DomainEventHandlerInterface, PaymentSuccessEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

@injectable()
export class PaymentSuccessEventHandler implements DomainEventHandlerInterface {
  private readonly DETAILED_MEASURES = new Map([
    [
      SubscriptionName.PlusPlan,
      new Map([
        [
          PaymentType.Initial,
          new Map([
            [SubscriptionBillingFrequency.Monthly, StatisticsMeasure.PlusSubscriptionInitialMonthlyPaymentsIncome],
            [SubscriptionBillingFrequency.Annual, StatisticsMeasure.PlusSubscriptionInitialAnnualPaymentsIncome],
          ]),
        ],
        [
          PaymentType.Renewal,
          new Map([
            [SubscriptionBillingFrequency.Monthly, StatisticsMeasure.PlusSubscriptionRenewingMonthlyPaymentsIncome],
            [SubscriptionBillingFrequency.Annual, StatisticsMeasure.PlusSubscriptionRenewingAnnualPaymentsIncome],
          ]),
        ],
      ]),
    ],
    [
      SubscriptionName.ProPlan,
      new Map([
        [
          PaymentType.Initial,
          new Map([
            [SubscriptionBillingFrequency.Monthly, StatisticsMeasure.ProSubscriptionInitialMonthlyPaymentsIncome],
            [SubscriptionBillingFrequency.Annual, StatisticsMeasure.ProSubscriptionInitialAnnualPaymentsIncome],
          ]),
        ],
        [
          PaymentType.Renewal,
          new Map([
            [SubscriptionBillingFrequency.Monthly, StatisticsMeasure.ProSubscriptionRenewingMonthlyPaymentsIncome],
            [SubscriptionBillingFrequency.Annual, StatisticsMeasure.ProSubscriptionRenewingAnnualPaymentsIncome],
          ]),
        ],
      ]),
    ],
  ])

  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
    @inject(TYPES.Logger) private logger: Logger,
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

    const statisticMeasures = [StatisticsMeasure.Income]

    const detailedMeasure = this.DETAILED_MEASURES.get(event.payload.subscriptionName as SubscriptionName)
      ?.get(event.payload.paymentType as PaymentType)
      ?.get(event.payload.billingFrequency as SubscriptionBillingFrequency)
    if (detailedMeasure !== undefined) {
      statisticMeasures.push(detailedMeasure)
    } else {
      this.logger.warn(
        `Could not find detailed measure for: subscription - ${event.payload.subscriptionName}, payment type - ${event.payload.paymentType}, billing frequency - ${event.payload.billingFrequency}`,
      )
    }

    for (const measure of statisticMeasures) {
      await this.statisticsStore.incrementMeasure(measure, event.payload.amount, [
        Period.Today,
        Period.ThisWeek,
        Period.ThisMonth,
      ])
    }
  }
}
