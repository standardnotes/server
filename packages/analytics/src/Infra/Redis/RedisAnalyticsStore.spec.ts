import * as IORedis from 'ioredis'
import { Period } from '../../Domain'
import { AnalyticsActivity } from '../../Domain/Analytics/AnalyticsActivity'
import { PeriodKeyGeneratorInterface } from '../../Domain/Time/PeriodKeyGeneratorInterface'

import { RedisAnalyticsStore } from './RedisAnalyticsStore'

describe('RedisAnalyticsStore', () => {
  let redisClient: IORedis.Redis
  let pipeline: IORedis.Pipeline
  let periodKeyGenerator: PeriodKeyGeneratorInterface

  const createStore = () => new RedisAnalyticsStore(periodKeyGenerator, redisClient)

  beforeEach(() => {
    pipeline = {} as jest.Mocked<IORedis.Pipeline>
    pipeline.incr = jest.fn()
    pipeline.setbit = jest.fn()
    pipeline.exec = jest.fn()

    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.pipeline = jest.fn().mockReturnValue(pipeline)
    redisClient.incr = jest.fn()
    redisClient.setbit = jest.fn()
    redisClient.getbit = jest.fn().mockReturnValue(1)
    redisClient.bitop = jest.fn()

    periodKeyGenerator = {} as jest.Mocked<PeriodKeyGeneratorInterface>
    periodKeyGenerator.getPeriodKey = jest.fn().mockReturnValue('period-key')
  })

  it('should calculate total count of activities', async () => {
    redisClient.bitcount = jest.fn().mockReturnValue(70)

    expect(await createStore().calculateActivityTotalCount(AnalyticsActivity.EditingItems, Period.Yesterday)).toEqual(
      70,
    )

    expect(redisClient.bitcount).toHaveBeenCalledWith('bitmap:action:editing-items:timespan:period-key')
  })

  it('should calculate activity retention', async () => {
    redisClient.bitcount = jest.fn().mockReturnValueOnce(7).mockReturnValueOnce(10)

    expect(
      await createStore().calculateActivityRetention(
        AnalyticsActivity.EditingItems,
        Period.DayBeforeYesterday,
        Period.Yesterday,
      ),
    ).toEqual(70)

    expect(redisClient.bitop).toHaveBeenCalledWith(
      'AND',
      'bitmap:action:editing-items:timespan:period-key-period-key',
      'bitmap:action:editing-items:timespan:period-key',
      'bitmap:action:editing-items:timespan:period-key',
    )
  })

  it('shoud tell if activity was done', async () => {
    await createStore().wasActivityDone(AnalyticsActivity.EditingItems, 123, Period.Yesterday)

    expect(redisClient.getbit).toHaveBeenCalledWith('bitmap:action:editing-items:timespan:period-key', 123)
  })

  it('should mark activity as done', async () => {
    await createStore().markActivity([AnalyticsActivity.EditingItems], 123, [Period.Today])

    expect(pipeline.setbit).toBeCalledTimes(1)
    expect(pipeline.setbit).toHaveBeenNthCalledWith(1, 'bitmap:action:editing-items:timespan:period-key', 123, 1)
    expect(pipeline.exec).toHaveBeenCalled()
  })

  it('should mark activities as done', async () => {
    await createStore().markActivity([AnalyticsActivity.EditingItems, AnalyticsActivity.EmailUnbackedUpData], 123, [
      Period.Today,
      Period.ThisWeek,
    ])

    expect(pipeline.setbit).toBeCalledTimes(4)
    expect(pipeline.setbit).toHaveBeenNthCalledWith(1, 'bitmap:action:editing-items:timespan:period-key', 123, 1)
    expect(pipeline.setbit).toHaveBeenNthCalledWith(2, 'bitmap:action:editing-items:timespan:period-key', 123, 1)
    expect(pipeline.setbit).toHaveBeenNthCalledWith(
      3,
      'bitmap:action:email-unbacked-up-data:timespan:period-key',
      123,
      1,
    )
    expect(pipeline.setbit).toHaveBeenNthCalledWith(
      4,
      'bitmap:action:email-unbacked-up-data:timespan:period-key',
      123,
      1,
    )
    expect(pipeline.exec).toHaveBeenCalled()
  })

  it('should unmark activity as done', async () => {
    await createStore().unmarkActivity([AnalyticsActivity.EditingItems], 123, [Period.Today])

    expect(pipeline.setbit).toBeCalledTimes(1)
    expect(pipeline.setbit).toHaveBeenNthCalledWith(1, 'bitmap:action:editing-items:timespan:period-key', 123, 0)
    expect(pipeline.exec).toHaveBeenCalled()
  })

  it('should unmark activities as done', async () => {
    await createStore().unmarkActivity([AnalyticsActivity.EditingItems, AnalyticsActivity.EmailUnbackedUpData], 123, [
      Period.Today,
      Period.ThisWeek,
    ])

    expect(pipeline.setbit).toBeCalledTimes(4)
    expect(pipeline.setbit).toHaveBeenNthCalledWith(1, 'bitmap:action:editing-items:timespan:period-key', 123, 0)
    expect(pipeline.setbit).toHaveBeenNthCalledWith(2, 'bitmap:action:editing-items:timespan:period-key', 123, 0)
    expect(pipeline.setbit).toHaveBeenNthCalledWith(
      3,
      'bitmap:action:email-unbacked-up-data:timespan:period-key',
      123,
      0,
    )
    expect(pipeline.setbit).toHaveBeenNthCalledWith(
      4,
      'bitmap:action:email-unbacked-up-data:timespan:period-key',
      123,
      0,
    )
    expect(pipeline.exec).toHaveBeenCalled()
  })
})
