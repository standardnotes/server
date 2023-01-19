export type GetSettingsDto = {
  userUuid: string
  settingName?: string
  allowSensitiveRetrieval?: boolean
  updatedAfter?: number
}
