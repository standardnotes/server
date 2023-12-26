import { SubscriptionPlanName } from '@standardnotes/domain-core'
import { UserSubscription } from './UserSubscription'
import { UserSubscriptionType } from './UserSubscriptionType'

export interface UserSubscriptionRepositoryInterface {
  findOneByUuid(uuid: string): Promise<UserSubscription | null>
  countByUserUuid(userUuid: string): Promise<number>
  findOneByUserUuid(userUuid: string): Promise<UserSubscription | null>
  findOneByUserUuidAndType(userUuid: string, type: UserSubscriptionType): Promise<UserSubscription | null>
  findByUserUuid(userUuid: string): Promise<UserSubscription[]>
  countByPlanName(planNames: SubscriptionPlanName[]): Promise<number>
  findByPlanName(planNames: SubscriptionPlanName[], offset: number, limit: number): Promise<UserSubscription[]>
  findOneByUserUuidAndSubscriptionId(userUuid: string, subscriptionId: number): Promise<UserSubscription | null>
  findBySubscriptionIdAndType(subscriptionId: number, type: UserSubscriptionType): Promise<UserSubscription[]>
  findBySubscriptionId(subscriptionId: number): Promise<UserSubscription[]>
  updateEndsAt(subscriptionId: number, endsAt: number, updatedAt: number): Promise<void>
  updateCancelled(subscriptionId: number, cancelled: boolean, updatedAt: number): Promise<void>
  countActiveSubscriptions(): Promise<number>
  save(subscription: UserSubscription): Promise<UserSubscription>
}
