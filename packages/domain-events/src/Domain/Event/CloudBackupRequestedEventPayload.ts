export interface CloudBackupRequestedEventPayload {
  cloudProvider: 'DROPBOX' | 'ONE_DRIVE' | 'GOOGLE_DRIVE'
  cloudProviderToken: string
  userUuid: string
  userHasEmailsMuted: boolean
  muteEmailsSettingUuid: string
}
