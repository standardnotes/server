import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'

import TYPES from '../../Bootstrap/Types'
import { OfflineUserSubscription } from '../../Domain/Subscription/OfflineUserSubscription'
import { OfflineUserSubscriptionRepositoryInterface } from '../../Domain/Subscription/OfflineUserSubscriptionRepositoryInterface'

@injectable()
export class TypeORMOfflineUserSubscriptionRepository implements OfflineUserSubscriptionRepositoryInterface {
  constructor(
    @inject(TYPES.Auth_ORMOfflineUserSubscriptionRepository)
    private ormRepository: Repository<OfflineUserSubscription>,
  ) {}

  async save(offlineUserSubscription: OfflineUserSubscription): Promise<OfflineUserSubscription> {
    return this.ormRepository.save(offlineUserSubscription)
  }

  async findOneBySubscriptionId(subscriptionId: number): Promise<OfflineUserSubscription | null> {
    return await this.ormRepository
      .createQueryBuilder()
      .where('subscription_id = :subscriptionId', {
        subscriptionId,
      })
      .getOne()
  }

  async findByEmail(email: string, activeAfter: number): Promise<OfflineUserSubscription[]> {
    return await this.ormRepository
      .createQueryBuilder()
      .where('email = :email AND ends_at > :endsAt', {
        email,
        endsAt: activeAfter,
      })
      .orderBy('ends_at', 'DESC')
      .getMany()
  }

  async findOneByEmail(email: string): Promise<OfflineUserSubscription | null> {
    const subscriptions = await this.ormRepository
      .createQueryBuilder()
      .where('email = :email', {
        email,
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

  async updateEndsAt(subscriptionId: number, endsAt: number, updatedAt: number): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update()
      .set({
        endsAt,
        updatedAt,
      })
      .where('subscription_id = :subscriptionId', {
        subscriptionId,
      })
      .execute()
  }
}
