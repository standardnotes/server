export interface DailyAnalyticsReportGeneratedEventPayload {
  activityStatistics: Array<{
    name: string
    retention: number
    totalCount: number
  }>
  statisticMeasures: Array<{
    name: string
    totalValue: number
    average: number
    increments: number
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
  statisticsOverTime: Array<{
    name: string
    period: number
    counts: Array<{
      periodKey: string
      totalCount: number
    }>
  }>
  churn: {
    periodKeys: Array<string>
    values: Array<{
      rate: number
      periodKey: string
    }>
  }
}
