import { SubscriptionName } from '@standardnotes/common'
import { Email } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { InvitationStatus } from '../../SharedSubscription/InvitationStatus'
import { InviteeIdentifierType } from '../../SharedSubscription/InviteeIdentifierType'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'

import { CancelSharedSubscriptionInvitationDTO } from './CancelSharedSubscriptionInvitationDTO'
import { CancelSharedSubscriptionInvitationResponse } from './CancelSharedSubscriptionInvitationResponse'

@injectable()
export class CancelSharedSubscriptionInvitation implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_SharedSubscriptionInvitationRepository)
    private sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface,
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_UserSubscriptionRepository)
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.Auth_RoleService) private roleService: RoleServiceInterface,
    @inject(TYPES.Auth_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Auth_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async execute(dto: CancelSharedSubscriptionInvitationDTO): Promise<CancelSharedSubscriptionInvitationResponse> {
    const sharedSubscriptionInvitation = await this.sharedSubscriptionInvitationRepository.findOneByUuid(
      dto.sharedSubscriptionInvitationUuid,
    )
    if (sharedSubscriptionInvitation === null) {
      this.logger.debug(
        `Could not find a shared subscription invitation with uuid ${dto.sharedSubscriptionInvitationUuid}`,
      )

      return {
        success: false,
      }
    }

    if (dto.inviterEmail !== sharedSubscriptionInvitation.inviterIdentifier) {
      this.logger.debug(
        `Subscription belongs to a different inviter (${sharedSubscriptionInvitation.inviterIdentifier}). Modifier: ${dto.inviterEmail}`,
      )

      return {
        success: false,
      }
    }

    const inviteeEmailOrError = Email.create(sharedSubscriptionInvitation.inviteeIdentifier)
    if (inviteeEmailOrError.isFailed()) {
      return {
        success: false,
      }
    }
    const inviteeEmail = inviteeEmailOrError.getValue()

    const invitee = await this.userRepository.findOneByUsernameOrEmail(inviteeEmail)

    const inviterUserSubscriptions = await this.userSubscriptionRepository.findBySubscriptionIdAndType(
      sharedSubscriptionInvitation.subscriptionId,
      UserSubscriptionType.Regular,
    )
    if (inviterUserSubscriptions.length === 0) {
      this.logger.debug(`Could not find a regular subscription with id ${sharedSubscriptionInvitation.subscriptionId}`)

      return {
        success: false,
      }
    }
    const inviterUserSubscription = inviterUserSubscriptions[0]

    sharedSubscriptionInvitation.status = InvitationStatus.Canceled
    sharedSubscriptionInvitation.updatedAt = this.timer.getTimestampInMicroseconds()

    await this.sharedSubscriptionInvitationRepository.save(sharedSubscriptionInvitation)

    if (invitee !== null) {
      await this.removeSharedSubscription(sharedSubscriptionInvitation.subscriptionId, invitee)

      await this.roleService.removeUserRole(invitee, inviterUserSubscription.planName as SubscriptionName)

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createSharedSubscriptionInvitationCanceledEvent({
          inviteeIdentifier: invitee.uuid,
          inviteeIdentifierType: InviteeIdentifierType.Uuid,
          inviterEmail: sharedSubscriptionInvitation.inviterIdentifier,
          inviterSubscriptionId: sharedSubscriptionInvitation.subscriptionId,
          inviterSubscriptionUuid: inviterUserSubscription.uuid,
          sharedSubscriptionInvitationUuid: sharedSubscriptionInvitation.uuid,
        }),
      )
    }

    return {
      success: true,
    }
  }

  private async removeSharedSubscription(subscriptionId: number, user: User): Promise<void> {
    const subscription = await this.userSubscriptionRepository.findOneByUserUuidAndSubscriptionId(
      user.uuid,
      subscriptionId,
    )

    if (subscription === null) {
      return
    }

    subscription.endsAt = this.timer.getTimestampInMicroseconds()

    await this.userSubscriptionRepository.save(subscription)
  }
}
