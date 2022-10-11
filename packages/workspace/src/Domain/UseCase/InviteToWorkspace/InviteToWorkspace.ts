import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { WorkspaceInvite } from '../../Invite/WorkspaceInvite'
import { WorkspaceInviteRepositoryInterface } from '../../Invite/WorkspaceInviteRepositoryInterface'
import { WorkspaceInviteStatus } from '../../Invite/WorkspaceInviteStatus'

import { UseCaseInterface } from '../UseCaseInterface'
import { InviteToWorkspaceDTO } from './InviteToWorkspaceDTO'
import { InviteToWorkspaceResponse } from './InviteToWorkspaceResponse'

@injectable()
export class InviteToWorkspace implements UseCaseInterface {
  constructor(
    @inject(TYPES.WorkspaceInviteRepository) private workspaceInviteRepository: WorkspaceInviteRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async execute(dto: InviteToWorkspaceDTO): Promise<InviteToWorkspaceResponse> {
    let invite = new WorkspaceInvite()
    invite.inviterUuid = dto.inviterUuid
    invite.inviteeEmail = dto.inviteeEmail
    invite.workspaceUuid = dto.workspaceUuid
    invite.status = WorkspaceInviteStatus.Created

    const timestamp = this.timer.getTimestampInMicroseconds()
    invite.createdAt = timestamp
    invite.updatedAt = timestamp

    invite = await this.workspaceInviteRepository.save(invite)

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createWorkspaceInviteCreatedEvent({
        inviterUuid: dto.inviterUuid,
        inviteeEmail: dto.inviteeEmail,
        workspaceUuid: dto.workspaceUuid,
        inviteUuid: invite.uuid,
      }),
    )

    return {
      invite,
    }
  }
}
