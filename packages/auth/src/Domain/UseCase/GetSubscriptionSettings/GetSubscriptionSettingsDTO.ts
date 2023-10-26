export interface GetSubscriptionSettingsDTO {
  userSubscriptionUuid: string
  decryptWith?: {
    userUuid: string
  }
}
