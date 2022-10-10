import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
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

    return {
      uuid: invite.uuid,
    }
  }
}
