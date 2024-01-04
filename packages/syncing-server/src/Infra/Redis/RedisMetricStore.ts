import * as IORedis from 'ioredis'
import { TimerInterface } from '@standardnotes/time'

import { MetricsStoreInterface } from '../../Domain/Metrics/MetricsStoreInterface'
import { Metric } from '../../Domain/Metrics/Metric'

export class RedisMetricStore implements MetricsStoreInterface {
  private readonly METRIC_PREFIX = 'metric'
  private readonly METRIC_PER_USER_PREFIX = 'metric-user'

  constructor(
    private redisClient: IORedis.Redis,
    private timer: TimerInterface,
  ) {}

  async storeUserBasedMetric(metric: Metric, value: number, userUuid: string): Promise<void> {
    const date = this.timer.convertMicrosecondsToDate(metric.props.timestamp)
    const dateToTheMinuteString = this.timer.convertDateToFormattedString(date, 'YYYY-MM-DD HH:mm')
    const key = `${this.METRIC_PER_USER_PREFIX}:${userUuid}:${metric.props.name}:${dateToTheMinuteString}`

    const pipeline = this.redisClient.pipeline()

    pipeline.incrbyfloat(key, value)
    pipeline.incr(`${this.METRIC_PER_USER_PREFIX}:${userUuid}:${Metric.NAMES.ItemOperation}:${dateToTheMinuteString}`)

    const expirationTime = 60 * 60 * 24
    pipeline.expire(key, expirationTime)

    await pipeline.exec()
  }

  async getStatistics(
    name: string,
    from: number,
    to: number,
  ): Promise<{ sum: number; max: number; min: number; sampleCount: number }> {
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
