import { DomainEventHandlerInterface, SubscriptionReassignedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UserSubscription } from '../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { SettingName } from '@standardnotes/settings'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { UserSubscriptionType } from '../Subscription/UserSubscriptionType'
import { Username } from '@standardnotes/domain-core'
import { ApplyDefaultSubscriptionSettings } from '../UseCase/ApplyDefaultSubscriptionSettings/ApplyDefaultSubscriptionSettings'
import { SetSettingValue } from '../UseCase/SetSettingValue/SetSettingValue'

export class SubscriptionReassignedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    private roleService: RoleServiceInterface,
    private logger: Logger,
    private applyDefaultSubscriptionSettings: ApplyDefaultSubscriptionSettings,
    private setSettingValue: SetSettingValue,
  ) {}

  async handle(event: SubscriptionReassignedEvent): Promise<void> {
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

    const result = await this.setSettingValue.execute({
      userUuid: user.uuid,
      settingName: SettingName.NAMES.ExtensionKey,
      value: event.payload.extensionKey,
      serverEncryptionVersion: EncryptionVersion.Default,
    })
    if (result.isFailed()) {
      this.logger.error(`Could not set extension key for user ${user.uuid}`)
    }

    const applyingSettingsResult = await this.applyDefaultSubscriptionSettings.execute({
      subscriptionPlanName: event.payload.subscriptionName,
      userUuid: user.uuid,
      userSubscriptionUuid: userSubscription.uuid,
    })
    if (applyingSettingsResult.isFailed()) {
      this.logger.error(
        `Could not apply default subscription settings for user ${user.uuid}: ${applyingSettingsResult.getError()}`,
      )
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
    subscription.user = Promise.resolve(user)
    subscription.createdAt = timestamp
    subscription.updatedAt = timestamp
    subscription.endsAt = subscriptionExpiresAt
    subscription.cancelled = false
    subscription.subscriptionId = subscriptionId
    subscription.subscriptionType = UserSubscriptionType.Regular

    return this.userSubscriptionRepository.save(subscription)
  }
}
