import { UserSubscription } from './UserSubscription'

export type FindRegularSubscriptionResponse = {
  regularSubscription: UserSubscription | null
  sharedSubscription: UserSubscription | null
}
