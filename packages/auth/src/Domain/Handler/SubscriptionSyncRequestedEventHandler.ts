import { OfflineFeaturesTokenData } from '@standardnotes/security'
import { SettingName, Username } from '@standardnotes/domain-core'
import { ContentDecoderInterface } from '@standardnotes/common'
import { DomainEventHandlerInterface, SubscriptionSyncRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UserSubscription } from '../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { OfflineSettingServiceInterface } from '../Setting/OfflineSettingServiceInterface'
import { OfflineSettingName } from '../Setting/OfflineSettingName'
import { UserSubscriptionType } from '../Subscription/UserSubscriptionType'
import { ApplyDefaultSubscriptionSettings } from '../UseCase/ApplyDefaultSubscriptionSettings/ApplyDefaultSubscriptionSettings'
import { SetSettingValue } from '../UseCase/SetSettingValue/SetSettingValue'
import { RenewSharedSubscriptions } from '../UseCase/RenewSharedSubscriptions/RenewSharedSubscriptions'

export class SubscriptionSyncRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
    private roleService: RoleServiceInterface,
    private applyDefaultSubscriptionSettings: ApplyDefaultSubscriptionSettings,
    private setSettingValue: SetSettingValue,
    private offlineSettingService: OfflineSettingServiceInterface,
    private contentDecoder: ContentDecoderInterface,
    private renewSharedSubscriptions: RenewSharedSubscriptions,
    private logger: Logger,
  ) {}

  async handle(event: SubscriptionSyncRequestedEvent): Promise<void> {
    if (!event.payload.subscriptionId) {
      this.logger.error('Subscription ID is missing', {
        codeTag: 'SubscriptionSyncRequestedEventHandler.handle',
        subscriptionId: event.payload.subscriptionId,
        userId: event.payload.userEmail,
      })

      return
    }

    this.logger.info('Subscription sync requested', {
      subscriptionId: event.payload.subscriptionId,
    })

    if (event.payload.offline) {
      this.logger.info('Syncing offline subscription', {
        subscriptionId: event.payload.subscriptionId,
      })

      const offlineUserSubscription = await this.createOrUpdateOfflineSubscription(
        event.payload.subscriptionId,
        event.payload.subscriptionName,
        event.payload.canceled,
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
        this.logger.error(`Could not renew shared offline subscriptions for user: ${renewalResult.getError()}`, {
          subscriptionId: event.payload.subscriptionId,
        })
      }

      await this.roleService.setOfflineUserRole(offlineUserSubscription)

      const offlineFeaturesTokenDecoded = this.contentDecoder.decode(
        event.payload.offlineFeaturesToken,
        0,
      ) as OfflineFeaturesTokenData

      if (!offlineFeaturesTokenDecoded.extensionKey) {
        this.logger.warn('Could not decode offline features token')

        return
      }

      await this.offlineSettingService.createOrUpdate({
        email: event.payload.userEmail,
        name: OfflineSettingName.FeaturesToken,
        value: offlineFeaturesTokenDecoded.extensionKey,
      })

      this.logger.info('Offline subscription synced', {
        subscriptionId: event.payload.subscriptionId,
      })

      return
    }

    const usernameOrError = Username.create(event.payload.userEmail)
    if (usernameOrError.isFailed()) {
      this.logger.warn(`Could not sync subscription: ${usernameOrError.getError()}`, {
        subscriptionId: event.payload.subscriptionId,
      })

      return
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)

    if (user === null) {
      this.logger.warn(`Could not find user with email: ${username.value}`, {
        subscriptionId: event.payload.subscriptionId,
      })

      return
    }

    this.logger.info('Syncing subscription', {
      userId: user.uuid,
      subscriptionId: event.payload.subscriptionId,
    })

    const userSubscription = await this.createOrUpdateSubscription(
      event.payload.subscriptionId,
      event.payload.subscriptionName,
      event.payload.canceled,
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
      this.logger.error(`Could not renew shared subscriptions for user: ${renewalResult.getError()}`, {
        userId: user.uuid,
      })
    }

    await this.roleService.addUserRoleBasedOnSubscription(user, event.payload.subscriptionName)

    const applyingSettingsResult = await this.applyDefaultSubscriptionSettings.execute({
      userSubscriptionUuid: userSubscription.uuid,
      userUuid: user.uuid,
      subscriptionPlanName: event.payload.subscriptionName,
    })
    if (applyingSettingsResult.isFailed()) {
      this.logger.error(
        `Could not apply default subscription settings for user ${user.uuid}: ${applyingSettingsResult.getError()}`,
      )
    }

    const result = await this.setSettingValue.execute({
      userUuid: user.uuid,
      settingName: SettingName.NAMES.ExtensionKey,
      value: event.payload.subscriptionName,
    })

    if (result.isFailed()) {
      this.logger.error(`Could not set extension key for user ${user.uuid}`)
    }

    this.logger.info('Subscription synced', {
      userId: user.uuid,
      subscriptionId: event.payload.subscriptionId,
    })
  }

  private async createOrUpdateSubscription(
    subscriptionId: number,
    subscriptionName: string,
    canceled: boolean,
    user: User,
    subscriptionExpiresAt: number,
    timestamp: number,
  ): Promise<UserSubscription> {
    let subscription = new UserSubscription()

    const subscriptions = await this.userSubscriptionRepository.findBySubscriptionIdAndType(
      subscriptionId,
      UserSubscriptionType.Regular,
    )
    if (subscriptions.length === 1) {
      subscription = subscriptions[0]
    }

    subscription.planName = subscriptionName
    subscription.userUuid = user.uuid
    subscription.createdAt = timestamp
    subscription.updatedAt = timestamp
    subscription.endsAt = subscriptionExpiresAt
    subscription.cancelled = canceled
    subscription.subscriptionId = subscriptionId
    subscription.subscriptionType = UserSubscriptionType.Regular

    return this.userSubscriptionRepository.save(subscription)
  }

  private async createOrUpdateOfflineSubscription(
    subscriptionId: number,
    subscriptionName: string,
    canceled: boolean,
    email: string,
    subscriptionExpiresAt: number,
    timestamp: number,
  ): Promise<OfflineUserSubscription> {
    let subscription = await this.offlineUserSubscriptionRepository.findOneBySubscriptionId(subscriptionId)
    if (subscription === null) {
      subscription = new OfflineUserSubscription()
    }

    subscription.planName = subscriptionName
    subscription.email = email
    subscription.createdAt = timestamp
    subscription.updatedAt = timestamp
    subscription.endsAt = subscriptionExpiresAt
    subscription.cancelled = canceled
    subscription.subscriptionId = subscriptionId

    return this.offlineUserSubscriptionRepository.save(subscription)
  }
}
