import { DomainEventHandlerInterface, SubscriptionCancelledEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { Logger } from 'winston'

@injectable()
export class SubscriptionCancelledEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Auth_UserSubscriptionRepository)
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_OfflineUserSubscriptionRepository)
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async handle(event: SubscriptionCancelledEvent): Promise<void> {
    if (!event.payload.subscriptionId) {
      this.logger.error('Subscription ID is missing', {
        codeTag: 'SubscriptionCancelledEventHandler.handle',
        subscriptionId: event.payload.subscriptionId,
        userId: event.payload.userEmail,
      })

      return
    }

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
