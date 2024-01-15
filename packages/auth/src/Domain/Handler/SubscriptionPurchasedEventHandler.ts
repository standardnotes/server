import { DomainEventHandlerInterface, SubscriptionPurchasedEvent } from '@standardnotes/domain-events'
import { Username } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UserSubscription } from '../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { UserSubscriptionType } from '../Subscription/UserSubscriptionType'
import { ApplyDefaultSubscriptionSettings } from '../UseCase/ApplyDefaultSubscriptionSettings/ApplyDefaultSubscriptionSettings'
import { RenewSharedSubscriptions } from '../UseCase/RenewSharedSubscriptions/RenewSharedSubscriptions'

export class SubscriptionPurchasedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    private applyDefaultSubscriptionSettings: ApplyDefaultSubscriptionSettings,
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
    private roleService: RoleServiceInterface,
    private renewSharedSubscriptions: RenewSharedSubscriptions,
    private logger: Logger,
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

      const renewalResult = await this.renewSharedSubscriptions.execute({
        inviterEmail: event.payload.userEmail,
        newSubscriptionId: event.payload.subscriptionId,
        newSubscriptionName: event.payload.subscriptionName,
        newSubscriptionExpiresAt: event.payload.subscriptionExpiresAt,
        timestamp: event.payload.timestamp,
      })
      if (renewalResult.isFailed()) {
        this.logger.error(`Could not renew shared offline subscriptions: ${renewalResult.getError()}`, {
          subscriptionId: event.payload.subscriptionId,
        })
      }

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

    const renewalResult = await this.renewSharedSubscriptions.execute({
      inviterEmail: user.email,
      newSubscriptionId: event.payload.subscriptionId,
      newSubscriptionName: event.payload.subscriptionName,
      newSubscriptionExpiresAt: event.payload.subscriptionExpiresAt,
      timestamp: event.payload.timestamp,
    })
    if (renewalResult.isFailed()) {
      this.logger.error(`Could not renew shared subscriptions for user ${user.uuid}: ${renewalResult.getError()}`)
    }

    await this.addUserRole(user, event.payload.subscriptionName)

    const result = await this.applyDefaultSubscriptionSettings.execute({
      userSubscriptionUuid: userSubscription.uuid,
      userUuid: user.uuid,
      subscriptionPlanName: event.payload.subscriptionName,
    })

    if (result.isFailed()) {
      this.logger.error(`Could not apply default subscription settings for user ${user.uuid}: ${result.getError()}`)
    }
  }

  private async addUserRole(user: User, subscriptionName: string): Promise<void> {
    await this.roleService.addUserRoleBasedOnSubscription(user, subscriptionName)
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
    subscription.userUuid = user.uuid
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
