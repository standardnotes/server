import { UserSubscription } from '../../Subscription/UserSubscription'

export type GetUserSubscriptionResponse =
  | {
      success: true
      user: { uuid: string; email: string }
      subscription: UserSubscription | null
    }
  | {
      success: false
      error: {
        message: string
      }
    }
