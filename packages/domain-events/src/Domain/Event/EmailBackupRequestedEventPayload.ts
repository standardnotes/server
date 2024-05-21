export interface EmailBackupRequestedEventPayload {
  userUuid: string
  keyParams: Record<string, unknown>
}
