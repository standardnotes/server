import * as IORedis from 'ioredis'

import { Period, PeriodKeyGeneratorInterface } from '../../Domain'

import { StatisticsStoreInterface } from '../../Domain/Statistics/StatisticsStoreInterface'

export class RedisStatisticsStore implements StatisticsStoreInterface {
  constructor(private periodKeyGenerator: PeriodKeyGeneratorInterface, private redisClient: IORedis.Redis) {}

  async getYesterdayOutOfSyncIncidents(): Promise<number> {
    const count = await this.redisClient.get(
      `count:action:out-of-sync:timespan:${this.periodKeyGenerator.getPeriodKey(Period.Yesterday)}`,
    )

    if (count === null) {
      return 0
    }

    return +count
  }

  async incrementOutOfSyncIncidents(): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.incr(`count:action:out-of-sync:timespan:${this.periodKeyGenerator.getPeriodKey(Period.Today)}`)
    pipeline.incr(`count:action:out-of-sync:timespan:${this.periodKeyGenerator.getPeriodKey(Period.ThisWeek)}`)
    pipeline.incr(`count:action:out-of-sync:timespan:${this.periodKeyGenerator.getPeriodKey(Period.ThisMonth)}`)

    await pipeline.exec()
  }

  async getYesterdaySNJSUsage(): Promise<{ version: string; count: number }[]> {
    const keys = await this.redisClient.keys(
      `count:action:snjs-request:*:timespan:${this.periodKeyGenerator.getPeriodKey(Period.Yesterday)}`,
    )

    return this.getRequestCountPerVersion(keys)
  }

  async getYesterdayApplicationUsage(): Promise<{ version: string; count: number }[]> {
    const keys = await this.redisClient.keys(
      `count:action:application-request:*:timespan:${this.periodKeyGenerator.getPeriodKey(Period.Yesterday)}`,
    )

    return this.getRequestCountPerVersion(keys)
  }

  async incrementApplicationVersionUsage(applicationVersion: string): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.incr(
      `count:action:application-request:${applicationVersion}:timespan:${this.periodKeyGenerator.getPeriodKey(
        Period.Today,
      )}`,
    )
    pipeline.incr(
      `count:action:application-request:${applicationVersion}:timespan:${this.periodKeyGenerator.getPeriodKey(
        Period.ThisWeek,
      )}`,
    )
    pipeline.incr(
      `count:action:application-request:${applicationVersion}:timespan:${this.periodKeyGenerator.getPeriodKey(
        Period.ThisMonth,
      )}`,
    )

    await pipeline.exec()
  }

  async incrementSNJSVersionUsage(snjsVersion: string): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.incr(
      `count:action:snjs-request:${snjsVersion}:timespan:${this.periodKeyGenerator.getPeriodKey(Period.Today)}`,
    )
    pipeline.incr(
      `count:action:snjs-request:${snjsVersion}:timespan:${this.periodKeyGenerator.getPeriodKey(Period.ThisWeek)}`,
    )
    pipeline.incr(
      `count:action:snjs-request:${snjsVersion}:timespan:${this.periodKeyGenerator.getPeriodKey(Period.ThisMonth)}`,
    )

    await pipeline.exec()
  }

  private async getRequestCountPerVersion(keys: string[]): Promise<{ version: string; count: number }[]> {
    const statistics = []
    for (const key of keys) {
      const count = await this.redisClient.get(key)
      const version = key.split(':')[3]
      statistics.push({
        version,
        count: +(count as string),
      })
    }

    return statistics
  }
}
