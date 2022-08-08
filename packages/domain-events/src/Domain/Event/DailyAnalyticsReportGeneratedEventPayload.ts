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
  activityStatisticsOverTime: Array<{
    name: string
    period: number
    counts: Array<{
      periodKey: string
      totalCount: number
    }>
  }>
  outOfSyncIncidents: number
}
