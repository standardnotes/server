export interface SetSubscriptionSettingValueDTO {
  settingName: string
  userSubscriptionUuid: string
  value: string | null
  sensitive: boolean
  serverEncryptionVersion: number
  newUserSubscriptionUuid?: string
}
