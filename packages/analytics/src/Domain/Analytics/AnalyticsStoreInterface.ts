import { Period } from '../Time/Period'
import { AnalyticsActivity } from './AnalyticsActivity'

export interface AnalyticsStoreInterface {
  unmarkActivity(activities: AnalyticsActivity[], analyticsId: number, periods: Period[]): Promise<void>
  markActivity(activities: AnalyticsActivity[], analyticsId: number, periods: Period[]): Promise<void>
  wasActivityDone(activity: AnalyticsActivity, analyticsId: number, period: Period): Promise<boolean>
  calculateActivityRetention(activity: AnalyticsActivity, firstPeriod: Period, secondPeriod: Period): Promise<number>
  calculateActivitiesRetention(parameters: {
    firstActivity: AnalyticsActivity
    firstActivityPeriodKey: string
    secondActivity: AnalyticsActivity
    secondActivityPeriodKey: string
  }): Promise<number>
  calculateActivityTotalCount(activity: AnalyticsActivity, period: Period): Promise<number>
  calculateActivityChangesTotalCount(
    activity: AnalyticsActivity,
    period: Period,
  ): Promise<Array<{ periodKey: string; totalCount: number }>>
  calculateActivityTotalCountOverTime(activity: AnalyticsActivity, period: Period): Promise<number>
}
