import * as IORedis from 'ioredis'
import { TimerInterface } from '@standardnotes/time'

import { MetricsStoreInterface } from '../../Domain/Metrics/MetricsStoreInterface'
import { Metric } from '../../Domain/Metrics/Metric'
import { Uuid } from '@standardnotes/domain-core'
import { MetricsSummary } from '../../Domain/Metrics/MetricsSummary'
import { Logger } from 'winston'

export class RedisMetricStore implements MetricsStoreInterface {
  private readonly METRIC_PREFIX = 'metric'
  private readonly METRIC_PER_USER_PREFIX = 'metric-user'

  constructor(
    private redisClient: IORedis.Redis,
    private timer: TimerInterface,
    private logger: Logger,
  ) {}

  async getUserBasedMetricsSummaryWithinTimeRange(dto: {
    metricName: string
    userUuid: Uuid
    from: Date
    to: Date
  }): Promise<MetricsSummary> {
    this.logger.debug(`Fetching user based metrics summary for ${dto.metricName}.`, {
      codeTag: 'RedisMetricStore',
      userId: dto.userUuid.value,
      from: dto.from.toISOString(),
      to: dto.to.toISOString(),
    })

    const keys = this.getKeysRepresentingMinutesBetweenFromAndTo(dto.from, dto.to)

    this.logger.debug(`Fetching user based metrics summary for ${dto.metricName} - keys: ${keys.join(', ')}.`, {
      codeTag: 'RedisMetricStore',
      userId: dto.userUuid.value,
    })

    let sum = 0
    let max = 0
    let min = 0
    let sampleCount = 0

    const values = await this.redisClient.mget(
      keys.map((key) => `${this.METRIC_PER_USER_PREFIX}:${dto.userUuid.value}:${dto.metricName}:${key}`),
    )

    this.logger.debug(`Fetching user based metrics summary for ${dto.metricName} - values: ${values.join(', ')}.`, {
      codeTag: 'RedisMetricStore',
      userId: dto.userUuid.value,
    })

    for (const value of values) {
      if (!value) {
        continue
      }

      const valueAsNumber = Number(value)

      sum += valueAsNumber
      sampleCount++

      if (valueAsNumber > max) {
        max = valueAsNumber
      }

      if (valueAsNumber < min) {
        min = valueAsNumber
      }
    }

    return {
      sum,
      max,
      min,
      sampleCount,
    }
  }

  async storeUserBasedMetric(metric: Metric, value: number, userUuid: Uuid): Promise<void> {
    const date = this.timer.convertMicrosecondsToDate(metric.props.timestamp)
    const dateToTheMinuteString = this.timer.convertDateToFormattedString(date, 'YYYY-MM-DD HH:mm')
    const key = `${this.METRIC_PER_USER_PREFIX}:${userUuid.value}:${metric.props.name}:${dateToTheMinuteString}`
    const itemOperationKey = `${this.METRIC_PER_USER_PREFIX}:${userUuid.value}:${Metric.NAMES.ItemOperation}:${dateToTheMinuteString}`

    const pipeline = this.redisClient.pipeline()

    pipeline.incrbyfloat(key, value)
    pipeline.incr(itemOperationKey)

    const expirationTime = 60 * 60 * 24
    pipeline.expire(key, expirationTime)
    pipeline.expire(itemOperationKey, expirationTime)

    await pipeline.exec()
  }

  async getUserBasedMetricsSummary(name: string, timestamp: number): Promise<MetricsSummary> {
    const date = this.timer.convertMicrosecondsToDate(timestamp)
    const dateToTheMinuteString = this.timer.convertDateToFormattedString(date, 'YYYY-MM-DD HH:mm')

    const userMetricsKeys = await this.redisClient.keys(
      `${this.METRIC_PER_USER_PREFIX}:*:${name}:${dateToTheMinuteString}`,
    )

    let sum = 0
    let max = 0
    let min = 0
    let sampleCount = 0

    const values = await this.redisClient.mget(userMetricsKeys)

    for (const value of values) {
      if (!value) {
        continue
      }

      const valueAsNumber = Number(value)

      sum += valueAsNumber
      sampleCount++

      if (valueAsNumber > max) {
        max = valueAsNumber
      }

      if (valueAsNumber < min) {
        min = valueAsNumber
      }
    }

    return {
      sum,
      max,
      min,
      sampleCount,
    }
  }

  async getMetricsSummary(name: string, from: number, to: number): Promise<MetricsSummary> {
    const keysRepresentingSecondsBetweenFromAndTo = this.getKeysRepresentingSecondsBetweenFromAndTo(from, to)

    let sum = 0
    let max = 0
    let min = 0
    let sampleCount = 0

    const values = await this.redisClient.mget(
      keysRepresentingSecondsBetweenFromAndTo.map((key) => `${this.METRIC_PREFIX}:${name}:${key}`),
    )

    for (const value of values) {
      if (!value) {
        continue
      }

      const valueAsNumber = Number(value)

      sum += valueAsNumber
      sampleCount++

      if (valueAsNumber > max) {
        max = valueAsNumber
      }

      if (valueAsNumber < min) {
        min = valueAsNumber
      }
    }

    return {
      sum,
      max,
      min,
      sampleCount,
    }
  }

  async storeMetric(metric: Metric): Promise<void> {
    const date = this.timer.convertMicrosecondsToDate(metric.props.timestamp)
    const dateToTheSecondString = this.timer.convertDateToFormattedString(date, 'YYYY-MM-DD HH:mm:ss')
    const key = `${this.METRIC_PREFIX}:${metric.props.name}:${dateToTheSecondString}`

    const pipeline = this.redisClient.pipeline()

    pipeline.incr(key)

    const expirationTime = 60 * 60 * 6
    pipeline.expire(key, expirationTime)

    await pipeline.exec()
  }

  private getKeysRepresentingMinutesBetweenFromAndTo(from: Date, to: Date): string[] {
    const keys: string[] = []

    let currentMinute = from

    while (currentMinute <= to) {
      const dateToTheMinuteString = this.timer.convertDateToFormattedString(currentMinute, 'YYYY-MM-DD HH:mm')

      keys.push(dateToTheMinuteString)

      currentMinute = new Date(currentMinute.getTime() + 60 * 1000)
    }

    return keys
  }

  private getKeysRepresentingSecondsBetweenFromAndTo(from: number, to: number): string[] {
    const keys: string[] = []

    const fromDate = this.timer.convertMicrosecondsToDate(from)

    const secondsFrom = this.timer.convertMicrosecondsToSeconds(from)
    const secondsTo = this.timer.convertMicrosecondsToSeconds(to)

    const secondsBetweenFromAndTo = secondsTo - secondsFrom

    for (let i = 0; i < secondsBetweenFromAndTo; i++) {
      const fromDatePlusSeconds = new Date(fromDate.getTime() + i * 1000)
      const dateToTheSecondString = this.timer.convertDateToFormattedString(fromDatePlusSeconds, 'YYYY-MM-DD HH:mm:ss')

      keys.push(dateToTheSecondString)
    }

    return keys
  }
}
