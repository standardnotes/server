import { DomainEventHandlerInterface, SubscriptionRenewedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { AnalyticsActivity, AnalyticsStoreInterface, Period } from '@standardnotes/analytics'

import TYPES from '../../Bootstrap/Types'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { SubscriptionName } from '@standardnotes/common'
import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { Logger } from 'winston'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class SubscriptionRenewedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.UserSubscriptionRepository) private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.OfflineUserSubscriptionRepository)
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
    @inject(TYPES.RoleService) private roleService: RoleServiceInterface,
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: SubscriptionRenewedEvent): Promise<void> {
    if (event.payload.offline) {
      const offlineUserSubscription = await this.offlineUserSubscriptionRepository.findOneBySubscriptionId(
        event.payload.subscriptionId,
      )

      if (offlineUserSubscription === null) {
        this.logger.warn(`Could not find offline user subscription with id: ${event.payload.subscriptionId}`)

        return
      }

      await this.updateOfflineSubscriptionEndsAt(offlineUserSubscription, event.payload.timestamp)

      await this.roleService.setOfflineUserRole(offlineUserSubscription)

      return
    }

    await this.updateSubscriptionEndsAt(
      event.payload.subscriptionId,
      event.payload.subscriptionExpiresAt,
      event.payload.timestamp,
    )

    const user = await this.userRepository.findOneByEmail(event.payload.userEmail)

    if (user === null) {
      this.logger.warn(`Could not find user with email: ${event.payload.userEmail}`)

      return
    }

    await this.addRoleToSubscriptionUsers(event.payload.subscriptionId, event.payload.subscriptionName)

    const { analyticsId } = await this.getUserAnalyticsId.execute({ userUuid: user.uuid })
    await this.analyticsStore.markActivity([AnalyticsActivity.SubscriptionRenewed], analyticsId, [Period.Today])
  }

  private async addRoleToSubscriptionUsers(subscriptionId: number, subscriptionName: SubscriptionName): Promise<void> {
    const userSubscriptions = await this.userSubscriptionRepository.findBySubscriptionId(subscriptionId)
    for (const userSubscription of userSubscriptions) {
      const user = await userSubscription.user

      await this.roleService.addUserRole(user, subscriptionName)
    }
  }

  private async updateSubscriptionEndsAt(
    subscriptionId: number,
    subscriptionExpiresAt: number,
    timestamp: number,
  ): Promise<void> {
    await this.userSubscriptionRepository.updateEndsAt(subscriptionId, subscriptionExpiresAt, timestamp)
  }

  private async updateOfflineSubscriptionEndsAt(
    offlineUserSubscription: OfflineUserSubscription,
    timestamp: number,
  ): Promise<void> {
    offlineUserSubscription.endsAt = timestamp
    offlineUserSubscription.updatedAt = timestamp

    await this.offlineUserSubscriptionRepository.save(offlineUserSubscription)
  }
}
