import { Uuid } from '@standardnotes/common'

import { SubscriptionToken } from './SubscriptionToken'

export interface SubscriptionTokenRepositoryInterface {
  save(subscriptionToken: SubscriptionToken): Promise<void>
  getUserUuidByToken(token: string): Promise<Uuid | undefined>
}
