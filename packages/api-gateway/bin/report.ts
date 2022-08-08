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
import { AnalyticsActivity, AnalyticsStoreInterface, Period, StatisticsStoreInterface } from '@standardnotes/analytics'

const requestReport = async (
  analyticsStore: AnalyticsStoreInterface,
  statisticsStore: StatisticsStoreInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
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
      activityStatistics: [
        {
          name: AnalyticsActivity.EditingItems,
          retention: await analyticsStore.calculateActivityRetention(
            AnalyticsActivity.EditingItems,
            Period.DayBeforeYesterday,
            Period.Yesterday,
          ),
          totalCount: await analyticsStore.calculateActivityTotalCount(
            AnalyticsActivity.EditingItems,
            Period.Yesterday,
          ),
        },
        {
          name: AnalyticsActivity.LimitedDiscountOfferPurchased,
          retention: 0,
          totalCount: await analyticsStore.calculateActivityTotalCount(
            AnalyticsActivity.LimitedDiscountOfferPurchased,
            Period.Yesterday,
          ),
        },
      ],
      activityStatisticsOverTime: [
        {
          name: AnalyticsActivity.GeneralActivity,
          period: Period.Last30Days,
          counts: await analyticsStore.calculateActivityChangesTotalCount(
            AnalyticsActivity.GeneralActivity,
            Period.Last30Days,
          ),
        },
      ],
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

  Promise.resolve(requestReport(analyticsStore, statisticsStore, domainEventPublisher))
    .then(() => {
      logger.info('Usage report generation complete')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish usage report generation: ${error.message}`)

      process.exit(1)
    })
})
