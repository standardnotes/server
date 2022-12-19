import * as IORedis from 'ioredis'

import { StatisticMeasure } from '../../Domain/Statistics/StatisticMeasure'
import { StatisticMeasureRepositoryInterface } from '../../Domain/Statistics/StatisticMeasureRepositoryInterface'

import { StatisticsStoreInterface } from '../../Domain/Statistics/StatisticsStoreInterface'
import { Period } from '../../Domain/Time/Period'
import { PeriodKeyGeneratorInterface } from '../../Domain/Time/PeriodKeyGeneratorInterface'

export class RedisStatisticsStore implements StatisticsStoreInterface, StatisticMeasureRepositoryInterface {
  constructor(private periodKeyGenerator: PeriodKeyGeneratorInterface, private redisClient: IORedis.Redis) {}

  async save(statisticMeasure: StatisticMeasure): Promise<void> {
    const periodKey = this.periodKeyGenerator.getDailyKey(statisticMeasure.props.date)

    await this.setMeasure(statisticMeasure.name, statisticMeasure.value, [periodKey])
  }

  async calculateTotalCountOverPeriod(
    measure: string,
    period: Period,
  ): Promise<{ periodKey: string; totalCount: number }[]> {
    if (
      ![
        Period.Last30Days,
        Period.Last30DaysIncludingToday,
        Period.ThisYear,
        Period.Q1ThisYear,
        Period.Q2ThisYear,
        Period.Q3ThisYear,
        Period.Q4ThisYear,
      ].includes(period)
    ) {
      throw new Error(`Unsuporrted period: ${period}`)
    }
    const periodKeys = this.periodKeyGenerator.getDiscretePeriodKeys(period)
    const counts = []
    for (const periodKey of periodKeys) {
      counts.push({
        periodKey,
        totalCount: await this.getMeasureTotal(measure, periodKey),
      })
    }

    return counts
  }

  async getMeasureIncrementCounts(measure: string, period: Period): Promise<number> {
    const increments = await this.redisClient.get(
      `count:increments:${measure}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`,
    )
    if (increments === null) {
      return 0
    }

    return +increments
  }

  async setMeasure(measure: string, value: number, periodsOrPeriodKeys: Period[] | string[]): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    for (const periodOrPeriodKey of periodsOrPeriodKeys) {
      let periodKey = periodOrPeriodKey
      if (!isNaN(+periodOrPeriodKey)) {
        periodKey = this.periodKeyGenerator.getPeriodKey(periodOrPeriodKey as Period)
      }

      pipeline.set(`count:measure:${measure}:timespan:${periodKey}`, value)
    }

    await pipeline.exec()
  }

  async getMeasureTotal(measure: string, periodOrPeriodKey: Period | string): Promise<number> {
    let periodKey = periodOrPeriodKey
    if (!isNaN(+periodOrPeriodKey)) {
      periodKey = this.periodKeyGenerator.getPeriodKey(periodOrPeriodKey as Period)
    }

    const totalValue = await this.redisClient.get(`count:measure:${measure}:timespan:${periodKey}`)

    if (totalValue === null) {
      return 0
    }

    return +totalValue
  }

  async incrementMeasure(measure: string, value: number, periods: Period[]): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    for (const period of periods) {
      pipeline.incrbyfloat(`count:measure:${measure}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`, value)
      pipeline.incr(`count:increments:${measure}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`)
    }

    await pipeline.exec()
  }

  async getMeasureAverage(measure: string, period: Period): Promise<number> {
    const increments = await this.getMeasureIncrementCounts(measure, period)

    if (increments === 0) {
      return 0
    }

    const totalValue = await this.getMeasureTotal(measure, period)

    return totalValue / increments
  }

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
