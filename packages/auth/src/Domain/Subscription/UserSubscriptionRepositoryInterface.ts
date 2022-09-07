import { Uuid } from '@standardnotes/common'
import { UserSubscription } from './UserSubscription'
import { UserSubscriptionType } from './UserSubscriptionType'

export interface UserSubscriptionRepositoryInterface {
  findOneByUuid(uuid: Uuid): Promise<UserSubscription | null>
  countByUserUuid(userUuid: Uuid): Promise<number>
  findOneByUserUuid(userUuid: Uuid): Promise<UserSubscription | null>
  findOneByUserUuidAndSubscriptionId(userUuid: Uuid, subscriptionId: number): Promise<UserSubscription | null>
  findBySubscriptionIdAndType(subscriptionId: number, type: UserSubscriptionType): Promise<UserSubscription[]>
  findBySubscriptionId(subscriptionId: number): Promise<UserSubscription[]>
  updateEndsAt(subscriptionId: number, endsAt: number, updatedAt: number): Promise<void>
  updateCancelled(subscriptionId: number, cancelled: boolean, updatedAt: number): Promise<void>
  save(subscription: UserSubscription): Promise<UserSubscription>
}
