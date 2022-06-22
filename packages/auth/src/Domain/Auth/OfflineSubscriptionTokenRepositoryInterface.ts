import { OfflineSubscriptionToken } from './OfflineSubscriptionToken'

export interface OfflineSubscriptionTokenRepositoryInterface {
  save(offlineSubscriptionToken: OfflineSubscriptionToken): Promise<void>
  getUserEmailByToken(token: string): Promise<string | undefined>
}
