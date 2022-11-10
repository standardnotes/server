import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'

import { AnalyticsActivity } from '../Analytics/AnalyticsActivity'
import { StatisticsMeasure } from '../Statistics/StatisticsMeasure'
import { Period } from '../Time/Period'

import { DomainEventFactory } from './DomainEventFactory'

describe('DomainEventFactory', () => {
  let timer: TimerInterface

  const createFactory = () => new DomainEventFactory(timer)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(1)
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(1))
  })

  it('should create a DAILY_ANALYTICS_REPORT_GENERATED event', () => {
    expect(
      createFactory().createDailyAnalyticsReportGeneratedEvent({
        activityStatistics: [
          {
            name: AnalyticsActivity.Register,
            retention: 24,
            totalCount: 45,
          },
        ],
        statisticMeasures: [
          {
            name: StatisticsMeasure.Income,
            totalValue: 43,
            average: 23,
            increments: 5,
            period: Period.Today,
          },
        ],
        activityStatisticsOverTime: [
          {
            name: AnalyticsActivity.Register,
            period: Period.Last30Days,
            counts: [
              {
                periodKey: '2022-10-9',
                totalCount: 3,
              },
            ],
            totalCount: 123,
          },
        ],
        statisticsOverTime: [
          {
            name: StatisticsMeasure.MRR,
            period: Period.Last30Days,
            counts: [
              {
                periodKey: '2022-10-9',
                totalCount: 3,
              },
            ],
          },
        ],
        churn: {
          periodKeys: ['2022-10-9'],
          values: [
            {
              rate: 12,
              periodKey: '2022-10-9',
            },
          ],
        },
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      meta: {
        correlation: {
          userIdentifier: '',
          userIdentifierType: 'uuid',
        },
        origin: 'analytics',
      },
      payload: {
        activityStatistics: [
          {
            name: 'register',
            retention: 24,
            totalCount: 45,
          },
        ],
        activityStatisticsOverTime: [
          {
            counts: [
              {
                periodKey: '2022-10-9',
                totalCount: 3,
              },
            ],
            name: 'register',
            period: 9,
            totalCount: 123,
          },
        ],
        statisticsOverTime: [
          {
            counts: [
              {
                periodKey: '2022-10-9',
                totalCount: 3,
              },
            ],
            name: 'mrr',
            period: 9,
          },
        ],
        churn: {
          periodKeys: ['2022-10-9'],
          values: [
            {
              periodKey: '2022-10-9',
              rate: 12,
            },
          ],
        },
        statisticMeasures: [
          {
            average: 23,
            increments: 5,
            name: 'income',
            period: 0,
            totalValue: 43,
          },
        ],
      },
      type: 'DAILY_ANALYTICS_REPORT_GENERATED',
    })
  })
})
