import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { WorkspaceInviteRepositoryInterface } from '../../Invite/WorkspaceInviteRepositoryInterface'
import { WorkspaceInviteStatus } from '../../Invite/WorkspaceInviteStatus'
import { WorkspaceUser } from '../../Workspace/WorkspaceUser'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'
import { WorkspaceUserStatus } from '../../Workspace/WorkspaceUserStatus'
import { UseCaseInterface } from '../UseCaseInterface'

import { AcceptInvitationDTO } from './AcceptInvitationDTO'
import { AcceptInvitationResponse } from './AcceptInvitationResponse'

@injectable()
export class AcceptInvitation implements UseCaseInterface {
  constructor(
    @inject(TYPES.WorkspaceInviteRepository) private workspaceInviteRepository: WorkspaceInviteRepositoryInterface,
    @inject(TYPES.WorkspaceUserRepository) private workspaceUserRepository: WorkspaceUserRepositoryInterface,
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

    return {
      success: true,
    }
  }
}
