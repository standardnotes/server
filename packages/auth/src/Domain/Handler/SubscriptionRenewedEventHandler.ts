import { DomainEventHandlerInterface, SubscriptionRenewedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { Logger } from 'winston'
import { OfflineUserSubscription } from '../Subscription/OfflineUserSubscription'
import { Username, Uuid } from '@standardnotes/domain-core'

@injectable()
export class SubscriptionRenewedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_UserSubscriptionRepository)
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_OfflineUserSubscriptionRepository)
    private offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_RoleService) private roleService: RoleServiceInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async handle(event: SubscriptionRenewedEvent): Promise<void> {
    if (!event.payload.subscriptionId) {
      this.logger.error('Subscription ID is missing', {
        codeTag: 'SubscriptionRenewedEventHandler.handle',
        subscriptionId: event.payload.subscriptionId,
        userId: event.payload.userEmail,
      })

      return
    }

    if (event.payload.offline) {
      const offlineUserSubscription = await this.offlineUserSubscriptionRepository.findOneBySubscriptionId(
        event.payload.subscriptionId,
      )

      if (offlineUserSubscription === null) {
        this.logger.warn(`Could not find offline user subscription with id: ${event.payload.subscriptionId}`)

        return
      }

      await this.updateOfflineSubscriptionEndsAt(
        offlineUserSubscription,
        event.payload.subscriptionExpiresAt,
        event.payload.timestamp,
      )

      await this.roleService.setOfflineUserRole(offlineUserSubscription)

      return
    }

    await this.updateSubscriptionEndsAt(
      event.payload.subscriptionId,
      event.payload.subscriptionExpiresAt,
      event.payload.timestamp,
    )

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

    await this.addRoleToSubscriptionUsers(event.payload.subscriptionId, event.payload.subscriptionName)
  }

  private async addRoleToSubscriptionUsers(subscriptionId: number, subscriptionName: string): Promise<void> {
    const userSubscriptions = await this.userSubscriptionRepository.findBySubscriptionId(subscriptionId)
    for (const userSubscription of userSubscriptions) {
      const userUuidOrError = Uuid.create(userSubscription.userUuid)
      if (userUuidOrError.isFailed()) {
        this.logger.warn(`Could not add role to user with uuid: ${userUuidOrError.getError()}`)

        continue
      }
      const userUuid = userUuidOrError.getValue()

      const user = await this.userRepository.findOneByUuid(userUuid)
      if (user === null) {
        this.logger.warn(`Could not find user with uuid: ${userUuid.value}`)

        continue
      }

      await this.roleService.addUserRoleBasedOnSubscription(user, subscriptionName)
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
    subscriptionExpiresAt: number,
    timestamp: number,
  ): Promise<void> {
    offlineUserSubscription.endsAt = subscriptionExpiresAt
    offlineUserSubscription.updatedAt = timestamp

    await this.offlineUserSubscriptionRepository.save(offlineUserSubscription)
  }
}
