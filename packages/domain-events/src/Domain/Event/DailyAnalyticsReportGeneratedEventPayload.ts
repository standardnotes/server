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
  outOfSyncIncidents: number
}
