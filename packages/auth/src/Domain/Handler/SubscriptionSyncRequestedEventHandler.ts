import { OfflineFeaturesTokenData } from '@standardnotes/security'
import { DomainEventHandlerInterface, SubscriptionSyncRequestedEvent } from '@standardnotes/domain-events'
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
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { OfflineSettingServiceInterface } from '../Setting/OfflineSettingServiceInterface'
import { ContentDecoderInterface } from '@standardnotes/common'
import { OfflineSettingName } from '../Setting/OfflineSettingName'
import { SettingName } from '@standardnotes/settings'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { UserSubscriptionType } from '../Subscription/UserSubscriptionType'
import { SubscriptionSettingServiceInterface } from '../Setting/SubscriptionSettingServiceInterface'
import { Username } from '@standardnotes/domain-core'

@injectable()
export class SubscriptionSyncRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_UserSubscriptionRepository)
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_OfflineUserSubscriptionRepository)
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_RoleService) private roleService: RoleServiceInterface,
    @inject(TYPES.Auth_SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.Auth_SubscriptionSettingService)
    private subscriptionSettingService: SubscriptionSettingServiceInterface,
    @inject(TYPES.Auth_OfflineSettingService) private offlineSettingService: OfflineSettingServiceInterface,
    @inject(TYPES.Auth_ContenDecoder) private contentDecoder: ContentDecoderInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async handle(event: SubscriptionSyncRequestedEvent): Promise<void> {
    if (event.payload.offline) {
      const offlineUserSubscription = await this.createOrUpdateOfflineSubscription(
        event.payload.subscriptionId,
        event.payload.subscriptionName,
        event.payload.canceled,
        event.payload.userEmail,
        event.payload.subscriptionExpiresAt,
        event.payload.timestamp,
      )

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

    const userSubscription = await this.createOrUpdateSubscription(
      event.payload.subscriptionId,
      event.payload.subscriptionName,
      event.payload.canceled,
      user,
      event.payload.subscriptionExpiresAt,
      event.payload.timestamp,
    )

    await this.roleService.addUserRole(user, event.payload.subscriptionName)

    await this.subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription(userSubscription)

    await this.settingService.createOrReplace({
      user,
      props: {
        name: SettingName.NAMES.ExtensionKey,
        unencryptedValue: event.payload.extensionKey,
        serverEncryptionVersion: EncryptionVersion.Default,
        sensitive: true,
      },
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
    subscription.user = Promise.resolve(user)
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
