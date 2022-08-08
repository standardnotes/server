import * as IORedis from 'ioredis'

import { Period } from '../../Domain/Time/Period'
import { PeriodKeyGeneratorInterface } from '../../Domain/Time/PeriodKeyGeneratorInterface'
import { AnalyticsActivity } from '../../Domain/Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../../Domain/Analytics/AnalyticsStoreInterface'

export class RedisAnalyticsStore implements AnalyticsStoreInterface {
  constructor(private periodKeyGenerator: PeriodKeyGeneratorInterface, private redisClient: IORedis.Redis) {}

  async calculateActivityChangesTotalCount(activity: AnalyticsActivity, period: Period): Promise<number[]> {
    if (period !== Period.Last30Days) {
      throw new Error(`Unsuporrted period: ${period}`)
    }

    const periodKeys = this.periodKeyGenerator.getDiscretePeriodKeys(Period.Last30Days)
    const counts = []
    for (const periodKey of periodKeys) {
      counts.push(await this.redisClient.bitcount(`bitmap:action:${activity}:timespan:${periodKey}`))
    }

    return counts
  }

  async markActivity(activities: AnalyticsActivity[], analyticsId: number, periods: Period[]): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    for (const activity of activities) {
      for (const period of periods) {
        pipeline.setbit(
          `bitmap:action:${activity}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`,
          analyticsId,
          1,
        )
      }
    }

    await pipeline.exec()
  }

  async unmarkActivity(activities: AnalyticsActivity[], analyticsId: number, periods: Period[]): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    for (const activity of activities) {
      for (const period of periods) {
        pipeline.setbit(
          `bitmap:action:${activity}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`,
          analyticsId,
          0,
        )
      }
    }

    await pipeline.exec()
  }

  async wasActivityDone(activity: AnalyticsActivity, analyticsId: number, period: Period): Promise<boolean> {
    const bitValue = await this.redisClient.getbit(
      `bitmap:action:${activity}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`,
      analyticsId,
    )

    return bitValue === 1
  }

  async calculateActivityRetention(
    activity: AnalyticsActivity,
    firstPeriod: Period,
    secondPeriod: Period,
  ): Promise<number> {
    const initialPeriodKey = this.periodKeyGenerator.getPeriodKey(firstPeriod)
    const subsequentPeriodKey = this.periodKeyGenerator.getPeriodKey(secondPeriod)

    const diffKey = `bitmap:action:${activity}:timespan:${initialPeriodKey}-${subsequentPeriodKey}`

    await this.redisClient.bitop(
      'AND',
      diffKey,
      `bitmap:action:${activity}:timespan:${initialPeriodKey}`,
      `bitmap:action:${activity}:timespan:${subsequentPeriodKey}`,
    )

    const retainedTotalInActivity = await this.redisClient.bitcount(diffKey)

    const initialTotalInActivity = await this.redisClient.bitcount(
      `bitmap:action:${activity}:timespan:${initialPeriodKey}`,
    )

    return Math.ceil((retainedTotalInActivity * 100) / initialTotalInActivity)
  }

  async calculateActivityTotalCount(activity: AnalyticsActivity, period: Period): Promise<number> {
    return this.redisClient.bitcount(
      `bitmap:action:${activity}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`,
    )
  }
}
