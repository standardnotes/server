import { SubscriptionToken } from './SubscriptionToken'

export interface SubscriptionTokenRepositoryInterface {
  save(subscriptionToken: SubscriptionToken): Promise<boolean>
  getUserUuidByToken(token: string): Promise<string | undefined>
}
