import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import {
  DomainEventPublisherInterface,
  DailyAnalyticsReportGeneratedEvent,
  DomainEventService,
} from '@standardnotes/domain-events'
import {
  AnalyticsActivity,
  AnalyticsStoreInterface,
  Period,
  PeriodKeyGeneratorInterface,
  StatisticsMeasure,
  StatisticsStoreInterface,
} from '@standardnotes/analytics'

const requestReport = async (
  analyticsStore: AnalyticsStoreInterface,
  statisticsStore: StatisticsStoreInterface,
  domainEventPublisher: DomainEventPublisherInterface,
  periodKeyGenerator: PeriodKeyGeneratorInterface,
  logger: Logger,
): Promise<void> => {
  const analyticsOverTime = []

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

  const yesterdayActivityStatistics = []
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
  const statisticMeasures = []
  for (const statisticMeasureName of statisticMeasureNames) {
    for (const period of [Period.Yesterday, Period.ThisMonth]) {
      statisticMeasures.push({
        name: statisticMeasureName,
        period,
        totalValue: await statisticsStore.getMeasureTotal(statisticMeasureName, period),
        average: await statisticsStore.getMeasureAverage(statisticMeasureName, period),
      })
    }
  }

  const periodKeys = periodKeyGenerator.getDiscretePeriodKeys(Period.Last7Days)
  const retentionOverDays = []
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
  const churnRates = []
  for (const monthPeriodKey of monthlyPeriodKeys) {
    const monthPeriod = periodKeyGenerator.convertPeriodKeyToPeriod(monthPeriodKey)
    logger.info(`Calculating churn for: ${monthPeriodKey} (${monthPeriod})`)
    const dailyPeriodKeys = periodKeyGenerator.getDiscretePeriodKeys(monthPeriod)

    const totalCustomerCounts: Array<number> = []
    for (const dailyPeriodKey of dailyPeriodKeys) {
      const customersCount = await statisticsStore.getMeasureTotal(StatisticsMeasure.TotalCustomers, dailyPeriodKey)
      logger.info(`Customers count for ${dailyPeriodKey}: ${customersCount}`)
      totalCustomerCounts.push(customersCount)
    }
    const filteredTotalCustomerCounts = totalCustomerCounts.filter((count) => !!count)
    const averageCustomersCount =
      filteredTotalCustomerCounts.reduce((total, current) => total + current, 0) / filteredTotalCustomerCounts.length
    logger.info(
      `Average customers count for ${monthPeriodKey} (total: ${filteredTotalCustomerCounts.length}): ${averageCustomersCount}`,
    )

    const existingCustomersChurn = await analyticsStore.calculateActivityTotalCount(
      AnalyticsActivity.ExistingCustomersChurn,
      monthPeriodKey,
    )
    logger.info(`Existing customers churn ${existingCustomersChurn}`)
    const newCustomersChurn = await analyticsStore.calculateActivityTotalCount(
      AnalyticsActivity.NewCustomersChurn,
      monthPeriodKey,
    )
    logger.info(`Existing customers churn ${newCustomersChurn}`)

    const totalChurn = existingCustomersChurn + newCustomersChurn

    logger.info(`Churn Rate: ${(totalChurn / averageCustomersCount) * 100}`)

    churnRates.push({
      periodKey: monthPeriodKey,
      rate: (totalChurn / averageCustomersCount) * 100,
    })
  }

  const event: DailyAnalyticsReportGeneratedEvent = {
    type: 'DAILY_ANALYTICS_REPORT_GENERATED',
    createdAt: new Date(),
    meta: {
      correlation: {
        userIdentifier: '',
        userIdentifierType: 'uuid',
      },
      origin: DomainEventService.ApiGateway,
    },
    payload: {
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
    },
  }

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
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)
  const periodKeyGenerator: PeriodKeyGeneratorInterface = container.get(TYPES.PeriodKeyGenerator)

  Promise.resolve(requestReport(analyticsStore, statisticsStore, domainEventPublisher, periodKeyGenerator, logger))
    .then(() => {
      logger.info('Usage report generation complete')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish usage report generation: ${error.message}`)

      process.exit(1)
    })
})
