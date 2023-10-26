export interface ApplyDefaultSubscriptionSettingsDTO {
  userUuid: string
  userSubscriptionUuid: string
  subscriptionPlanName: string
  overrides?: Map<string, string>
}
