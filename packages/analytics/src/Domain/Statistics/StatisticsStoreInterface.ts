import { Period } from '../Time/Period'

export interface StatisticsStoreInterface {
  incrementSNJSVersionUsage(snjsVersion: string): Promise<void>
  incrementApplicationVersionUsage(applicationVersion: string): Promise<void>
  incrementOutOfSyncIncidents(): Promise<void>
  getYesterdaySNJSUsage(): Promise<Array<{ version: string; count: number }>>
  getYesterdayApplicationUsage(): Promise<Array<{ version: string; count: number }>>
  getYesterdayOutOfSyncIncidents(): Promise<number>
  incrementMeasure(measure: string, value: number, periods: Period[]): Promise<void>
  setMeasure(measure: string, value: number, periods: Period[]): Promise<void>
  getMeasureAverage(measure: string, period: Period): Promise<number>
  getMeasureTotal(measure: string, periodOrPeriodKey: Period | string): Promise<number>
  getMeasureIncrementCounts(measure: string, period: Period): Promise<number>
  calculateTotalCountOverPeriod(
    measure: string,
    period: Period,
  ): Promise<Array<{ periodKey: string; totalCount: number }>>
}
