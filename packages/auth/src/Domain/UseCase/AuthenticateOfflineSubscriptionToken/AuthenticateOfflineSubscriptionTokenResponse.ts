export type AuthenticateOfflineSubscriptionTokenResponse =
  | {
      success: true
      email: string
      featuresToken: string
    }
  | {
      success: false
    }
