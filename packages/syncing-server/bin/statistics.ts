import 'reflect-metadata'

import { Logger } from 'winston'
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { MetricsStoreInterface } from '../src/Domain/Metrics/MetricsStoreInterface'
import { Metric } from '../src/Domain/Metrics/Metric'
import { Time, TimerInterface } from '@standardnotes/time'

const sendStatistics = async (
  metricsStore: MetricsStoreInterface,
  timer: TimerInterface,
  awsRegion: string,
): Promise<void> => {
  const cloudwatchClient = new CloudWatchClient({
    region: awsRegion,
  })

  const minutesToProcess = 30

  const metricsToProcess = [Metric.NAMES.ItemCreated, Metric.NAMES.ItemUpdated]

  for (const metricToProcess of metricsToProcess) {
    for (let i = 0; i <= minutesToProcess; i++) {
      const dateNMinutesAgo = timer.getUTCDateNMinutesAgo(minutesToProcess - i)
      const timestamp = timer.convertDateToMicroseconds(dateNMinutesAgo)

      const statistics = await metricsStore.getStatistics(
        metricToProcess,
        timestamp,
        timestamp + Time.MicrosecondsInAMinute,
      )

      if (statistics.sampleCount === 0) {
        continue
      }

      await cloudwatchClient.send(
        new PutMetricDataCommand({
          Namespace: 'SyncingServer',
          MetricData: [
            {
              MetricName: metricToProcess,
              Timestamp: dateNMinutesAgo,
              StatisticValues: {
                Maximum: statistics.max,
                Minimum: statistics.min,
                SampleCount: statistics.sampleCount,
                Sum: statistics.sum,
              },
            },
          ],
        }),
      )
    }
  }

  const userMetricsToProcess = [Metric.NAMES.ItemOperation, Metric.NAMES.ContentSizeUtilized]
  for (const metricToProcess of userMetricsToProcess) {
    for (let i = 0; i <= minutesToProcess; i++) {
      const dateNMinutesAgo = timer.getUTCDateNMinutesAgo(minutesToProcess - i)
      const timestamp = timer.convertDateToMicroseconds(dateNMinutesAgo)

      const statistics = await metricsStore.getUserBasedStatistics(metricToProcess, timestamp)

      if (statistics.sampleCount === 0) {
        continue
      }

      await cloudwatchClient.send(
        new PutMetricDataCommand({
          Namespace: 'SyncingServer',
          MetricData: [
            {
              MetricName: metricToProcess,
              Timestamp: dateNMinutesAgo,
              StatisticValues: {
                Maximum: statistics.max,
                Minimum: statistics.min,
                SampleCount: statistics.sampleCount,
                Sum: statistics.sum,
              },
            },
          ],
        }),
      )
    }
  }
}

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Sync_Logger)

  logger.info('Starting statistics sending')

  const metricsStore = container.get<MetricsStoreInterface>(TYPES.Sync_MetricsStore)
  const timer = container.get<TimerInterface>(TYPES.Sync_Timer)
  const awsRegion = env.get('SNS_AWS_REGION', true)

  Promise.resolve(sendStatistics(metricsStore, timer, awsRegion))
    .then(() => {
      logger.info('Finished statistics sending')

      process.exit(0)
    })
    .catch((error) => {
      logger.error('Error while sending statistics', error)

      process.exit(1)
    })
})
