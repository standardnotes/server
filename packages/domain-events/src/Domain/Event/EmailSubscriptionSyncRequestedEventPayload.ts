export interface EmailSubscriptionSyncRequestedEventPayload {
  username: string
  userUuid: string
  subscriptionPlanName: string | null
  muteFailedBackupsEmails: boolean
  muteFailedCloudBackupsEmails: boolean
  muteMarketingEmails: boolean
  muteSignInEmails: boolean
}
