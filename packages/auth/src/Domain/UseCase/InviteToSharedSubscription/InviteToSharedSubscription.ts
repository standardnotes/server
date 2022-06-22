import { RoleName } from '@standardnotes/common'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { InvitationStatus } from '../../SharedSubscription/InvitationStatus'
import { InviteeIdentifierType } from '../../SharedSubscription/InviteeIdentifierType'
import { InviterIdentifierType } from '../../SharedSubscription/InviterIdentifierType'
import { SharedSubscriptionInvitation } from '../../SharedSubscription/SharedSubscriptionInvitation'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'

import { InviteToSharedSubscriptionDTO } from './InviteToSharedSubscriptionDTO'
import { InviteToSharedSubscriptionResult } from './InviteToSharedSubscriptionResult'

@injectable()
export class InviteToSharedSubscription implements UseCaseInterface {
  private readonly MAX_NUMBER_OF_INVITES = 5
  constructor(
    @inject(TYPES.UserSubscriptionRepository) private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.SharedSubscriptionInvitationRepository)
    private sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: InviteToSharedSubscriptionDTO): Promise<InviteToSharedSubscriptionResult> {
    if (!dto.inviterRoles.includes(RoleName.ProUser)) {
      return {
        success: false,
      }
    }

    const numberOfUsedInvites = await this.sharedSubscriptionInvitationRepository.countByInviterEmailAndStatus(
      dto.inviterEmail,
      [InvitationStatus.Sent, InvitationStatus.Accepted],
    )
    if (numberOfUsedInvites >= this.MAX_NUMBER_OF_INVITES) {
      return {
        success: false,
      }
    }

    const inviterUserSubscription = await this.userSubscriptionRepository.findOneByUserUuid(dto.inviterUuid)
    if (inviterUserSubscription === null) {
      return {
        success: false,
      }
    }

    const sharedSubscriptionInvition = new SharedSubscriptionInvitation()
    sharedSubscriptionInvition.inviterIdentifier = dto.inviterEmail
    sharedSubscriptionInvition.inviterIdentifierType = InviterIdentifierType.Email
    sharedSubscriptionInvition.inviteeIdentifier = dto.inviteeIdentifier
    sharedSubscriptionInvition.inviteeIdentifierType = this.isInviteeIdentifierPotentiallyAVaultAccount(
      dto.inviteeIdentifier,
    )
      ? InviteeIdentifierType.Hash
      : InviteeIdentifierType.Email
    sharedSubscriptionInvition.status = InvitationStatus.Sent
    sharedSubscriptionInvition.subscriptionId = inviterUserSubscription.subscriptionId as number
    sharedSubscriptionInvition.createdAt = this.timer.getTimestampInMicroseconds()
    sharedSubscriptionInvition.updatedAt = this.timer.getTimestampInMicroseconds()

    const savedInvitation = await this.sharedSubscriptionInvitationRepository.save(sharedSubscriptionInvition)

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createSharedSubscriptionInvitationCreatedEvent({
        inviterEmail: dto.inviterEmail,
        inviterSubscriptionId: inviterUserSubscription.subscriptionId as number,
        inviteeIdentifier: dto.inviteeIdentifier,
        inviteeIdentifierType: savedInvitation.inviteeIdentifierType,
        sharedSubscriptionInvitationUuid: savedInvitation.uuid,
      }),
    )

    return {
      success: true,
      sharedSubscriptionInvitationUuid: savedInvitation.uuid,
    }
  }

  private isInviteeIdentifierPotentiallyAVaultAccount(identifier: string): boolean {
    return identifier.length === 64 && !identifier.includes('@')
  }
}
