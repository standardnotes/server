import { OfflineUserSubscription } from '../../Subscription/OfflineUserSubscription'

export type GetUserOfflineSubscriptionResponse =
  | {
      success: true
      subscription: OfflineUserSubscription | null
    }
  | {
      success: false
      error: {
        message: string
      }
    }
