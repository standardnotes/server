import { TimerInterface } from '@standardnotes/time'
import { WorkspaceUserStatus } from '@standardnotes/common'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { WorkspaceInviteRepositoryInterface } from '../../Invite/WorkspaceInviteRepositoryInterface'
import { WorkspaceInviteStatus } from '../../Invite/WorkspaceInviteStatus'
import { WorkspaceUser } from '../../Workspace/WorkspaceUser'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'

import { AcceptInvitationDTO } from './AcceptInvitationDTO'
import { AcceptInvitationResponse } from './AcceptInvitationResponse'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

@injectable()
export class AcceptInvitation implements UseCaseInterface {
  constructor(
    @inject(TYPES.WorkspaceInviteRepository) private workspaceInviteRepository: WorkspaceInviteRepositoryInterface,
    @inject(TYPES.WorkspaceUserRepository) private workspaceUserRepository: WorkspaceUserRepositoryInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: AcceptInvitationDTO): Promise<AcceptInvitationResponse> {
    const invite = await this.workspaceInviteRepository.findOneByUuid(dto.invitationUuid)
    if (invite === null) {
      return {
        success: false,
      }
    }

    invite.acceptingUserUuid = dto.acceptingUserUuid
    invite.updatedAt = this.timer.getTimestampInMicroseconds()
    invite.status = WorkspaceInviteStatus.Accepted

    await this.workspaceInviteRepository.save(invite)

    const workspaceUser = new WorkspaceUser()
    workspaceUser.userUuid = dto.acceptingUserUuid
    workspaceUser.userDisplayName = invite.inviteeEmail
    workspaceUser.workspaceUuid = invite.workspaceUuid
    workspaceUser.publicKey = dto.publicKey
    workspaceUser.encryptedPrivateKey = dto.encryptedPrivateKey
    workspaceUser.accessLevel = invite.accessLevel
    workspaceUser.status = WorkspaceUserStatus.PendingKeyshare

    await this.workspaceUserRepository.save(workspaceUser)

    const event = this.domainEventFactory.createWorkspaceInviteAcceptedEvent({
      inviteeUuid: invite.acceptingUserUuid,
      inviterUuid: invite.inviterUuid,
      workspaceUuid: invite.workspaceUuid,
    })

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createWebSocketMessageRequestedEvent({
        userUuid: invite.inviterUuid,
        message: JSON.stringify(event),
      }),
    )

    return {
      success: true,
    }
  }
}
