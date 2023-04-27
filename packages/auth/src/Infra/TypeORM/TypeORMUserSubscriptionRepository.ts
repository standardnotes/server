import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'
import TYPES from '../../Bootstrap/Types'

import { UserSubscription } from '../../Domain/Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Domain/Subscription/UserSubscriptionRepositoryInterface'
import { UserSubscriptionType } from '../../Domain/Subscription/UserSubscriptionType'

@injectable()
export class TypeORMUserSubscriptionRepository implements UserSubscriptionRepositoryInterface {
  constructor(
    @inject(TYPES.ORMUserSubscriptionRepository)
    private ormRepository: Repository<UserSubscription>,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async countActiveSubscriptions(): Promise<number> {
    return await this.ormRepository
      .createQueryBuilder()
      .where('ends_at > :timestamp', { timestamp: this.timer.getTimestampInMicroseconds() })
      .groupBy('user_uuid')
      .getCount()
  }

  async findByUserUuid(userUuid: string): Promise<UserSubscription[]> {
    return await this.ormRepository
      .createQueryBuilder()
      .where('user_uuid = :user_uuid', {
        user_uuid: userUuid,
      })
      .orderBy('ends_at', 'DESC')
      .getMany()
  }

  async countByUserUuid(userUuid: string): Promise<number> {
    return await this.ormRepository
      .createQueryBuilder()
      .where('user_uuid = :user_uuid', {
        user_uuid: userUuid,
      })
      .getCount()
  }

  async save(subscription: UserSubscription): Promise<UserSubscription> {
    return this.ormRepository.save(subscription)
  }

  async findOneByUserUuidAndSubscriptionId(userUuid: string, subscriptionId: number): Promise<UserSubscription | null> {
    return await this.ormRepository
      .createQueryBuilder()
      .where('user_uuid = :userUuid AND subscription_id = :subscriptionId', {
        userUuid,
        subscriptionId,
      })
      .getOne()
  }

  async findBySubscriptionIdAndType(subscriptionId: number, type: UserSubscriptionType): Promise<UserSubscription[]> {
    return await this.ormRepository
      .createQueryBuilder()
      .where('subscription_id = :subscriptionId AND subscription_type = :type', {
        subscriptionId,
        type,
      })
      .orderBy('created_at', 'DESC')
      .getMany()
  }

  async findBySubscriptionId(subscriptionId: number): Promise<UserSubscription[]> {
    return await this.ormRepository
      .createQueryBuilder()
      .where('subscription_id = :subscriptionId', {
        subscriptionId,
      })
      .orderBy('created_at', 'DESC')
      .getMany()
  }

  async findOneByUuid(uuid: string): Promise<UserSubscription | null> {
    return await this.ormRepository
      .createQueryBuilder()
      .where('uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async findOneByUserUuid(userUuid: string): Promise<UserSubscription | null> {
    const subscriptions = await this.ormRepository
      .createQueryBuilder()
      .where('user_uuid = :user_uuid', {
        user_uuid: userUuid,
      })
      .orderBy('ends_at', 'DESC')
      .getMany()

    const uncanceled = subscriptions.find((subscription) => !subscription.cancelled)
    if (uncanceled !== undefined) {
      return uncanceled
    }

    if (subscriptions.length !== 0) {
      return subscriptions[0]
    }

    return null
  }

  async updateEndsAt(subscriptionId: number, endsAt: number, timestamp: number): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update()
      .set({
        endsAt,
        updatedAt: timestamp,
        renewedAt: timestamp,
      })
      .where('subscription_id = :subscriptionId', {
        subscriptionId,
      })
      .execute()
  }

  async updateCancelled(subscriptionId: number, cancelled: boolean, updatedAt: number): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update()
      .set({
        cancelled,
        updatedAt,
      })
      .where('subscription_id = :subscriptionId', {
        subscriptionId,
      })
      .execute()
  }
}
