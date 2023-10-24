export interface SetSettingValueDTO {
  settingName: string
  userUuid: string
  value: string | null
  sensitive: boolean
  serverEncryptionVersion: number
}
