import { Uuid } from '@standardnotes/domain-core'

import { SubscriptionSetting } from './SubscriptionSetting'

export interface SubscriptionSettingRepositoryInterface {
  findOneByUuid(uuid: Uuid): Promise<SubscriptionSetting | null>
  findLastByNameAndUserSubscriptionUuid(name: string, userSubscriptionUuid: Uuid): Promise<SubscriptionSetting | null>
  findAllBySubscriptionUuid(userSubscriptionUuid: Uuid): Promise<SubscriptionSetting[]>
  insert(subscriptionSetting: SubscriptionSetting): Promise<void>
  update(subscriptionSetting: SubscriptionSetting): Promise<void>
  /**
   * Atomically adds `delta` to the numeric value of the `(name, userSubscriptionUuid)` counter
   * setting at the database level, clamped to a minimum of 0, creating the row if it does not yet
   * exist. Relies on the unique index on `(name, user_subscription_uuid)` to avoid the
   * read-modify-write and create-if-missing races that occur when this is computed in application
   * code.
   */
  incrementCounterValueForNameAndUserSubscriptionUuid(
    name: string,
    userSubscriptionUuid: Uuid,
    delta: number,
    updatedAt: number,
  ): Promise<void>
}
