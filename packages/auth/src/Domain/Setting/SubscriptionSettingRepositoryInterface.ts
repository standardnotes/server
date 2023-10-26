import { Uuid } from '@standardnotes/domain-core'

import { SubscriptionSetting } from './SubscriptionSetting'

export interface SubscriptionSettingRepositoryInterface {
  findOneByUuid(uuid: Uuid): Promise<SubscriptionSetting | null>
  findLastByNameAndUserSubscriptionUuid(name: string, userSubscriptionUuid: Uuid): Promise<SubscriptionSetting | null>
  findAllBySubscriptionUuid(userSubscriptionUuid: Uuid): Promise<SubscriptionSetting[]>
  insert(subscriptionSetting: SubscriptionSetting): Promise<void>
  update(subscriptionSetting: SubscriptionSetting): Promise<void>
}
