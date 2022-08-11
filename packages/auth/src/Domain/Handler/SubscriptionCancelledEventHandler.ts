import { DomainEventHandlerInterface, SubscriptionCancelledEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { AnalyticsActivity, AnalyticsStoreInterface, Period } from '@standardnotes/analytics'

@injectable()
export class SubscriptionCancelledEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UserSubscriptionRepository) private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.OfflineUserSubscriptionRepository)
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
  ) {}
  async handle(event: SubscriptionCancelledEvent): Promise<void> {
    if (event.payload.offline) {
      await this.updateOfflineSubscriptionCancelled(event.payload.subscriptionId, event.payload.timestamp)

      return
    }

    await this.updateSubscriptionCancelled(event.payload.subscriptionId, event.payload.timestamp)

    const user = await this.userRepository.findOneByEmail(event.payload.userEmail)
    if (user !== null) {
      const { analyticsId } = await this.getUserAnalyticsId.execute({ userUuid: user.uuid })
      await this.analyticsStore.markActivity([AnalyticsActivity.SubscriptionCancelled], analyticsId, [
        Period.Today,
        Period.ThisWeek,
        Period.ThisMonth,
      ])
    }
  }

  private async updateSubscriptionCancelled(subscriptionId: number, timestamp: number): Promise<void> {
    await this.userSubscriptionRepository.updateCancelled(subscriptionId, true, timestamp)
  }

  private async updateOfflineSubscriptionCancelled(subscriptionId: number, timestamp: number): Promise<void> {
    await this.offlineUserSubscriptionRepository.updateCancelled(subscriptionId, true, timestamp)
  }
}
