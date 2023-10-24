export interface GetSubscriptionSettingDTO {
  userSubscriptionUuid: string
  settingName: string
  allowSensitiveRetrieval: boolean
  decryptWith?: {
    userUuid: string
  }
}
