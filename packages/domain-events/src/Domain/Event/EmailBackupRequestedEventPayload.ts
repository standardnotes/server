export interface EmailBackupRequestedEventPayload {
  userUuid: string
  userHasEmailsMuted: boolean
  muteEmailsSettingUuid: string
  keyParams: Record<string, unknown>
}
