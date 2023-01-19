import { UserSubscription } from './UserSubscription'
import { UserSubscriptionType } from './UserSubscriptionType'

export interface UserSubscriptionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<UserSubscription | null>
  countByUserUuid(userUuid: string): Promise<number>
  findOneByUserUuid(userUuid: string): Promise<UserSubscription | null>
  findByUserUuid(userUuid: string): Promise<UserSubscription[]>
  findOneByUserUuidAndSubscriptionId(userUuid: string, subscriptionId: number): Promise<UserSubscription | null>
  findBySubscriptionIdAndType(subscriptionId: number, type: UserSubscriptionType): Promise<UserSubscription[]>
  findBySubscriptionId(subscriptionId: number): Promise<UserSubscription[]>
  updateEndsAt(subscriptionId: number, endsAt: number, updatedAt: number): Promise<void>
  updateCancelled(subscriptionId: number, cancelled: boolean, updatedAt: number): Promise<void>
  countActiveSubscriptions(): Promise<number>
  save(subscription: UserSubscription): Promise<UserSubscription>
}
