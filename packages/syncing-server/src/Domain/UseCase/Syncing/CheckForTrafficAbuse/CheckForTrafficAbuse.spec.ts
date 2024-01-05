import { TimerInterface } from '@standardnotes/time'
import { MetricsStoreInterface } from '../../../Metrics/MetricsStoreInterface'
import { CheckForTrafficAbuse } from './CheckForTrafficAbuse'
import { MetricsSummary } from '../../../Metrics/MetricsSummary'
import { Metric } from '../../../Metrics/Metric'
import { Logger } from 'winston'

describe('CheckForTrafficAbuse', () => {
  let metricsStore: MetricsStoreInterface
  let timer: TimerInterface
  let timeframeLengthInMinutes: number
  let threshold: number
  let logger: Logger

  const createUseCase = () => new CheckForTrafficAbuse(metricsStore, timer, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    const metricsSummary: MetricsSummary = {
      sum: 101,
      max: 0,
      min: 0,
      sampleCount: 0,
    }

    metricsStore = {} as jest.Mocked<MetricsStoreInterface>
    metricsStore.getUserBasedMetricsSummaryWithinTimeRange = jest.fn().mockReturnValue(metricsSummary)

    timer = {} as TimerInterface
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(0)
    timer.getUTCDateNMinutesAgo = jest.fn().mockReturnValue(new Date(0))
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(10))

    timeframeLengthInMinutes = 5

    threshold = 100
  })

  it('returns a failure result if the user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      metricToCheck: Metric.NAMES.ItemOperation,
      timeframeLengthInMinutes,
      threshold,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('return a failure result if the metric name is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      metricToCheck: 'invalid',
      timeframeLengthInMinutes,
      threshold,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns a failure result if the metric summary is above the threshold', async () => {
    const metricsSummary: MetricsSummary = {
      sum: 101,
      max: 0,
      min: 0,
      sampleCount: 0,
    }

    metricsStore.getUserBasedMetricsSummaryWithinTimeRange = jest.fn().mockReturnValue(metricsSummary)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      metricToCheck: Metric.NAMES.ItemOperation,
      timeframeLengthInMinutes,
      threshold,
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('returns a success result if the metric summary is below the threshold', async () => {
    const metricsSummary: MetricsSummary = {
      sum: 99,
      max: 0,
      min: 0,
      sampleCount: 0,
    }

    metricsStore.getUserBasedMetricsSummaryWithinTimeRange = jest.fn().mockReturnValue(metricsSummary)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      metricToCheck: Metric.NAMES.ItemOperation,
      timeframeLengthInMinutes,
      threshold,
    })

    expect(result.isFailed()).toBeFalsy()
  })
})
