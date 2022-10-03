export interface DailyAnalyticsReportGeneratedEventPayload {
  snjsStatistics: Array<{
    version: string
    count: number
  }>
  applicationStatistics: Array<{
    version: string
    count: number
  }>
  activityStatistics: Array<{
    name: string
    retention: number
    totalCount: number
  }>
  statisticMeasures: Array<{
    name: string
    totalValue: number
    average: number
    period: number
  }>
  activityStatisticsOverTime: Array<{
    name: string
    period: number
    counts: Array<{
      periodKey: string
      totalCount: number
    }>
    totalCount: number
  }>
  outOfSyncIncidents: number
  retentionStatistics: Array<{
    firstActivity: string
    secondActivity: string
    retention: {
      periodKeys: Array<string>
      values: Array<{
        firstPeriodKey: string
        secondPeriodKey: string
        value: number
      }>
    }
  }>
  churn: {
    periodKeys: Array<string>
    values: Array<{
      rate: number
      periodKey: string
    }>
  }
}
