import { OfflineSubscriptionToken } from '../../Auth/OfflineSubscriptionToken'

export type CreateOfflineSubscriptionTokenResponse =
  | {
      success: true
      offlineSubscriptionToken: OfflineSubscriptionToken
    }
  | {
      success: false
      error: 'no-subscription' | 'subscription-canceled' | 'subscription-expired'
    }
