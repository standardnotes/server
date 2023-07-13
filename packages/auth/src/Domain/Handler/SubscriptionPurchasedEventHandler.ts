import { DomainEventHandlerInterface, SubscriptionPurchasedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UserSubscription } from '../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { UserSubscriptionType } from '../Subscription/UserSubscriptionType'
import { SubscriptionSettingServiceInterface } from '../Setting/SubscriptionSettingServiceInterface'
import { Username } from '@standardnotes/domain-core'

@injectable()
export class SubscriptionPurchasedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_UserSubscriptionRepository)
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_OfflineUserSubscriptionRepository)
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_RoleService) private roleService: RoleServiceInterface,
    @inject(TYPES.Auth_SubscriptionSettingService)
    private subscriptionSettingService: SubscriptionSettingServiceInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async handle(event: SubscriptionPurchasedEvent): Promise<void> {
    if (event.payload.offline) {
      const offlineUserSubscription = await this.createOfflineSubscription(
        event.payload.subscriptionId,
        event.payload.subscriptionName,
        event.payload.userEmail,
        event.payload.subscriptionExpiresAt,
        event.payload.timestamp,
      )

      await this.roleService.setOfflineUserRole(offlineUserSubscription)

      return
    }

    const usernameOrError = Username.create(event.payload.userEmail)
    if (usernameOrError.isFailed()) {
      return
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)

    if (user === null) {
      this.logger.warn(`Could not find user with email: ${username.value}`)
      return
    }

    const userSubscription = await this.createSubscription(
      event.payload.subscriptionId,
      event.payload.subscriptionName,
      user,
      event.payload.subscriptionExpiresAt,
      event.payload.timestamp,
    )

    await this.addUserRole(user, event.payload.subscriptionName)

    await this.subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription(userSubscription)
  }

  private async addUserRole(user: User, subscriptionName: string): Promise<void> {
    await this.roleService.addUserRole(user, subscriptionName)
  }

  private async createSubscription(
    subscriptionId: number,
    subscriptionName: string,
    user: User,
    subscriptionExpiresAt: number,
    timestamp: number,
  ): Promise<UserSubscription> {
    const subscription = new UserSubscription()
    subscription.planName = subscriptionName
    subscription.user = Promise.resolve(user)
    subscription.createdAt = timestamp
    subscription.updatedAt = timestamp
    subscription.endsAt = subscriptionExpiresAt
    subscription.cancelled = false
    subscription.subscriptionId = subscriptionId
    subscription.subscriptionType = UserSubscriptionType.Regular

    return this.userSubscriptionRepository.save(subscription)
  }

  private async createOfflineSubscription(
    subscriptionId: number,
    subscriptionName: string,
    email: string,
    subscriptionExpiresAt: number,
    timestamp: number,
  ): Promise<OfflineUserSubscription> {
    const subscription = new OfflineUserSubscription()
    subscription.planName = subscriptionName
    subscription.email = email
    subscription.createdAt = timestamp
    subscription.updatedAt = timestamp
    subscription.endsAt = subscriptionExpiresAt
    subscription.cancelled = false
    subscription.subscriptionId = subscriptionId

    return this.offlineUserSubscriptionRepository.save(subscription)
  }
}
