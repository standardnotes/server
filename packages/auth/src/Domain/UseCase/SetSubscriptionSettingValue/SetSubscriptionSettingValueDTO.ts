export interface SetSubscriptionSettingValueDTO {
  settingName: string
  userSubscriptionUuid: string
  value: string | null
  serverEncryptionVersion: number
  newUserSubscriptionUuid?: string
}
