import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'

import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { AnalyticsActivity } from '../src/Domain/Analytics/AnalyticsActivity'
import { Period } from '../src/Domain/Time/Period'
import { StatisticsMeasure } from '../src/Domain/Statistics/StatisticsMeasure'
import { AnalyticsStoreInterface } from '../src/Domain/Analytics/AnalyticsStoreInterface'
import { StatisticsStoreInterface } from '../src/Domain/Statistics/StatisticsStoreInterface'
import { PeriodKeyGeneratorInterface } from '../src/Domain/Time/PeriodKeyGeneratorInterface'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'

const requestReport = async (
  analyticsStore: AnalyticsStoreInterface,
  statisticsStore: StatisticsStoreInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
  periodKeyGenerator: PeriodKeyGeneratorInterface,
): Promise<void> => {
  const analyticsOverTime: Array<{
    name: string
    period: number
    counts: Array<{
      periodKey: string
      totalCount: number
    }>
    totalCount: number
  }> = []

  const thirtyDaysAnalyticsNames = [
    AnalyticsActivity.GeneralActivity,
    AnalyticsActivity.EditingItems,
    AnalyticsActivity.SubscriptionPurchased,
    AnalyticsActivity.Register,
    AnalyticsActivity.SubscriptionRenewed,
    AnalyticsActivity.DeleteAccount,
    AnalyticsActivity.SubscriptionCancelled,
    AnalyticsActivity.SubscriptionRefunded,
    AnalyticsActivity.ExistingCustomersChurn,
    AnalyticsActivity.NewCustomersChurn,
    AnalyticsActivity.SubscriptionReactivated,
  ]

  for (const analyticsName of thirtyDaysAnalyticsNames) {
    analyticsOverTime.push({
      name: analyticsName,
      period: Period.Last30Days,
      counts: await analyticsStore.calculateActivityChangesTotalCount(analyticsName, Period.Last30Days),
      totalCount: await analyticsStore.calculateActivityTotalCountOverTime(analyticsName, Period.Last30Days),
    })
  }

  const quarterlyAnalyticsNames = [
    AnalyticsActivity.Register,
    AnalyticsActivity.SubscriptionPurchased,
    AnalyticsActivity.SubscriptionRenewed,
  ]

  for (const analyticsName of quarterlyAnalyticsNames) {
    for (const period of [Period.Q1ThisYear, Period.Q2ThisYear, Period.Q3ThisYear, Period.Q4ThisYear]) {
      analyticsOverTime.push({
        name: analyticsName,
        period: period,
        counts: await analyticsStore.calculateActivityChangesTotalCount(analyticsName, period),
        totalCount: await analyticsStore.calculateActivityTotalCountOverTime(analyticsName, period),
      })
    }
  }

  const yesterdayActivityStatistics: Array<{
    name: string
    retention: number
    totalCount: number
  }> = []
  const yesterdayActivityNames = [
    AnalyticsActivity.LimitedDiscountOfferPurchased,
    AnalyticsActivity.GeneralActivity,
    AnalyticsActivity.GeneralActivityFreeUsers,
    AnalyticsActivity.GeneralActivityPaidUsers,
    AnalyticsActivity.PaymentFailed,
    AnalyticsActivity.PaymentSuccess,
    AnalyticsActivity.NewCustomersChurn,
    AnalyticsActivity.ExistingCustomersChurn,
  ]

  for (const activityName of yesterdayActivityNames) {
    yesterdayActivityStatistics.push({
      name: activityName,
      retention: await analyticsStore.calculateActivityRetention(
        activityName,
        Period.DayBeforeYesterday,
        Period.Yesterday,
      ),
      totalCount: await analyticsStore.calculateActivityTotalCount(activityName, Period.Yesterday),
    })
  }

  const statisticMeasureNames = [
    StatisticsMeasure.Income,
    StatisticsMeasure.PlusSubscriptionInitialAnnualPaymentsIncome,
    StatisticsMeasure.PlusSubscriptionInitialMonthlyPaymentsIncome,
    StatisticsMeasure.PlusSubscriptionRenewingAnnualPaymentsIncome,
    StatisticsMeasure.PlusSubscriptionRenewingMonthlyPaymentsIncome,
    StatisticsMeasure.ProSubscriptionInitialAnnualPaymentsIncome,
    StatisticsMeasure.ProSubscriptionInitialMonthlyPaymentsIncome,
    StatisticsMeasure.ProSubscriptionRenewingAnnualPaymentsIncome,
    StatisticsMeasure.ProSubscriptionRenewingMonthlyPaymentsIncome,
    StatisticsMeasure.Refunds,
    StatisticsMeasure.RegistrationLength,
    StatisticsMeasure.SubscriptionLength,
    StatisticsMeasure.RegistrationToSubscriptionTime,
    StatisticsMeasure.RemainingSubscriptionTimePercentage,
    StatisticsMeasure.NotesCountFreeUsers,
    StatisticsMeasure.NotesCountPaidUsers,
    StatisticsMeasure.FilesCount,
    StatisticsMeasure.NewCustomers,
    StatisticsMeasure.TotalCustomers,
  ]
  const statisticMeasures: Array<{
    name: string
    totalValue: number
    average: number
    increments: number
    period: number
  }> = []
  for (const statisticMeasureName of statisticMeasureNames) {
    for (const period of [Period.Yesterday, Period.ThisMonth]) {
      statisticMeasures.push({
        name: statisticMeasureName,
        period,
        totalValue: await statisticsStore.getMeasureTotal(statisticMeasureName, period),
        average: await statisticsStore.getMeasureAverage(statisticMeasureName, period),
        increments: await statisticsStore.getMeasureIncrementCounts(statisticMeasureName, period),
      })
    }
  }

  const periodKeys = periodKeyGenerator.getDiscretePeriodKeys(Period.Last7Days)
  const retentionOverDays: Array<{
    firstPeriodKey: string
    secondPeriodKey: string
    value: number
  }> = []
  for (let i = 0; i < periodKeys.length; i++) {
    for (let j = 0; j < periodKeys.length - i; j++) {
      const dailyRetention = await analyticsStore.calculateActivitiesRetention({
        firstActivity: AnalyticsActivity.Register,
        firstActivityPeriodKey: periodKeys[i],
        secondActivity: AnalyticsActivity.GeneralActivity,
        secondActivityPeriodKey: periodKeys[i + j],
      })

      retentionOverDays.push({
        firstPeriodKey: periodKeys[i],
        secondPeriodKey: periodKeys[i + j],
        value: dailyRetention,
      })
    }
  }

  const monthlyPeriodKeys = periodKeyGenerator.getDiscretePeriodKeys(Period.ThisYear)
  const churnRates: Array<{
    rate: number
    periodKey: string
  }> = []
  for (const monthPeriodKey of monthlyPeriodKeys) {
    const monthPeriod = periodKeyGenerator.convertPeriodKeyToPeriod(monthPeriodKey)
    const dailyPeriodKeys = periodKeyGenerator.getDiscretePeriodKeys(monthPeriod)

    const totalCustomerCounts: Array<number> = []
    for (const dailyPeriodKey of dailyPeriodKeys) {
      const customersCount = await statisticsStore.getMeasureTotal(StatisticsMeasure.TotalCustomers, dailyPeriodKey)
      totalCustomerCounts.push(customersCount)
    }
    const filteredTotalCustomerCounts = totalCustomerCounts.filter((count) => !!count)
    const averageCustomersCount = filteredTotalCustomerCounts.length
      ? filteredTotalCustomerCounts.reduce((total, current) => total + current, 0) / filteredTotalCustomerCounts.length
      : 0

    const existingCustomersChurn = await analyticsStore.calculateActivityTotalCount(
      AnalyticsActivity.ExistingCustomersChurn,
      monthPeriodKey,
    )
    const newCustomersChurn = await analyticsStore.calculateActivityTotalCount(
      AnalyticsActivity.NewCustomersChurn,
      monthPeriodKey,
    )

    const totalChurn = existingCustomersChurn + newCustomersChurn

    churnRates.push({
      periodKey: monthPeriodKey,
      rate: averageCustomersCount ? (totalChurn / averageCustomersCount) * 100 : 0,
    })
  }

  const event = domainEventFactory.createDailyAnalyticsReportGeneratedEvent({
    applicationStatistics: await statisticsStore.getYesterdayApplicationUsage(),
    snjsStatistics: await statisticsStore.getYesterdaySNJSUsage(),
    outOfSyncIncidents: await statisticsStore.getYesterdayOutOfSyncIncidents(),
    activityStatistics: yesterdayActivityStatistics,
    activityStatisticsOverTime: analyticsOverTime,
    statisticMeasures,
    retentionStatistics: [
      {
        firstActivity: AnalyticsActivity.Register,
        secondActivity: AnalyticsActivity.GeneralActivity,
        retention: {
          periodKeys,
          values: retentionOverDays,
        },
      },
    ],
    churn: {
      periodKeys: monthlyPeriodKeys,
      values: churnRates,
    },
  })

  await domainEventPublisher.publish(event)
}

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info('Starting usage report generation...')

  const analyticsStore: AnalyticsStoreInterface = container.get(TYPES.AnalyticsStore)
  const statisticsStore: StatisticsStoreInterface = container.get(TYPES.StatisticsStore)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)
  const periodKeyGenerator: PeriodKeyGeneratorInterface = container.get(TYPES.PeriodKeyGenerator)

  Promise.resolve(
    requestReport(analyticsStore, statisticsStore, domainEventFactory, domainEventPublisher, periodKeyGenerator),
  )
    .then(() => {
      logger.info('Usage report generation complete')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish usage report generation: ${error.message}`)

      process.exit(1)
    })
})
