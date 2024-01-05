export interface CheckForTrafficAbuseDTO {
  userUuid: string
  metricToCheck: string
  timeframeLengthInMinutes: number
  threshold: number
}
