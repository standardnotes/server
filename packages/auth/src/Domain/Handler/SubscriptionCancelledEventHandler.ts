import { DomainEventHandlerInterface, SubscriptionCancelledEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'

@injectable()
export class SubscriptionCancelledEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UserSubscriptionRepository) private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.OfflineUserSubscriptionRepository)
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
  ) {}
  async handle(event: SubscriptionCancelledEvent): Promise<void> {
    if (event.payload.offline) {
      await this.updateOfflineSubscriptionCancelled(event.payload.subscriptionId, event.payload.timestamp)

      return
    }

    await this.updateSubscriptionCancelled(event.payload.subscriptionId, event.payload.timestamp)
  }

  private async updateSubscriptionCancelled(subscriptionId: number, timestamp: number): Promise<void> {
    await this.userSubscriptionRepository.updateCancelled(subscriptionId, true, timestamp)
  }

  private async updateOfflineSubscriptionCancelled(subscriptionId: number, timestamp: number): Promise<void> {
    await this.offlineUserSubscriptionRepository.updateCancelled(subscriptionId, true, timestamp)
  }
}
