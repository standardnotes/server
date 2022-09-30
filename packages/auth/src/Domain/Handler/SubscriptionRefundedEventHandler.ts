import { SubscriptionName, Uuid } from '@standardnotes/common'
import { DomainEventHandlerInterface, SubscriptionRefundedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import {
  AnalyticsActivity,
  AnalyticsStoreInterface,
  Period,
  StatisticsMeasure,
  StatisticsStoreInterface,
} from '@standardnotes/analytics'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'

@injectable()
export class SubscriptionRefundedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.UserSubscriptionRepository) private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.OfflineUserSubscriptionRepository)
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
    @inject(TYPES.RoleService) private roleService: RoleServiceInterface,
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: SubscriptionRefundedEvent): Promise<void> {
    if (event.payload.offline) {
      await this.updateOfflineSubscriptionEndsAt(event.payload.subscriptionId, event.payload.timestamp)

      return
    }

    const user = await this.userRepository.findOneByEmail(event.payload.userEmail)

    if (user === null) {
      this.logger.warn(`Could not find user with email: ${event.payload.userEmail}`)
      return
    }

    await this.updateSubscriptionEndsAt(event.payload.subscriptionId, event.payload.timestamp)
    await this.removeRoleFromSubscriptionUsers(event.payload.subscriptionId, event.payload.subscriptionName)

    const { analyticsId } = await this.getUserAnalyticsId.execute({ userUuid: user.uuid })
    await this.analyticsStore.markActivity([AnalyticsActivity.SubscriptionRefunded], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    await this.markChurnActivity(analyticsId, user.uuid)
  }

  private async removeRoleFromSubscriptionUsers(
    subscriptionId: number,
    subscriptionName: SubscriptionName,
  ): Promise<void> {
    const userSubscriptions = await this.userSubscriptionRepository.findBySubscriptionId(subscriptionId)
    for (const userSubscription of userSubscriptions) {
      await this.roleService.removeUserRole(await userSubscription.user, subscriptionName)
    }
  }

  private async updateSubscriptionEndsAt(subscriptionId: number, timestamp: number): Promise<void> {
    await this.userSubscriptionRepository.updateEndsAt(subscriptionId, timestamp, timestamp)
  }

  private async updateOfflineSubscriptionEndsAt(subscriptionId: number, timestamp: number): Promise<void> {
    await this.offlineUserSubscriptionRepository.updateEndsAt(subscriptionId, timestamp, timestamp)
  }

  private async markChurnActivity(analyticsId: number, userUuid: Uuid): Promise<void> {
    const existingSubscriptionsCount = await this.userSubscriptionRepository.countByUserUuid(userUuid)

    const churnActivity =
      existingSubscriptionsCount > 1 ? AnalyticsActivity.ExistingCustomersChurn : AnalyticsActivity.NewCustomersChurn

    for (const period of [Period.ThisMonth, Period.ThisWeek, Period.Today]) {
      const customerPurchasedInPeriod = await this.analyticsStore.wasActivityDone(
        AnalyticsActivity.SubscriptionPurchased,
        analyticsId,
        period,
      )
      if (customerPurchasedInPeriod) {
        await this.analyticsStore.markActivity([churnActivity], analyticsId, [period])
      }
    }

    const activeSubscriptions = await this.userSubscriptionRepository.countActiveSubscriptions()
    await this.statisticsStore.setMeasure(StatisticsMeasure.TotalCustomers, activeSubscriptions, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
      Period.ThisYear,
    ])
  }
}
