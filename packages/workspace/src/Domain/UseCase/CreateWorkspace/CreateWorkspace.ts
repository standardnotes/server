import { TimerInterface } from '@standardnotes/time'
import { WorkspaceAccessLevel } from '@standardnotes/common'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { Workspace } from '../../Workspace/Workspace'
import { WorkspaceRepositoryInterface } from '../../Workspace/WorkspaceRepositoryInterface'
import { WorkspaceUser } from '../../Workspace/WorkspaceUser'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'
import { WorkspaceUserStatus } from '../../Workspace/WorkspaceUserStatus'
import { UseCaseInterface } from '../UseCaseInterface'

import { CreateWorkspaceDTO } from './CreateWorkspaceDTO'
import { CreateWorkspaceResponse } from './CreateWorkspaceResponse'

@injectable()
export class CreateWorkspace implements UseCaseInterface {
  constructor(
    @inject(TYPES.WorkspaceRepository) private workspaceRepository: WorkspaceRepositoryInterface,
    @inject(TYPES.WorkspaceUserRepository) private workspaceUserRepository: WorkspaceUserRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: CreateWorkspaceDTO): Promise<CreateWorkspaceResponse> {
    let workspace = new Workspace()
    if (dto.name !== undefined) {
      workspace.name = dto.name
    }
    workspace.type = dto.type
    const timestamp = this.timer.getTimestampInMicroseconds()
    workspace.createdAt = timestamp
    workspace.updatedAt = timestamp

    workspace = await this.workspaceRepository.save(workspace)

    const ownerAssociation = new WorkspaceUser()
    ownerAssociation.accessLevel = WorkspaceAccessLevel.Owner
    if (dto.encryptedWorkspaceKey !== undefined) {
      ownerAssociation.encryptedWorkspaceKey = dto.encryptedWorkspaceKey
    }
    if (dto.encryptedPrivateKey !== undefined) {
      ownerAssociation.encryptedPrivateKey = dto.encryptedPrivateKey
    }
    if (dto.publicKey !== undefined) {
      ownerAssociation.publicKey = dto.publicKey
    }
    ownerAssociation.status = WorkspaceUserStatus.Active
    ownerAssociation.userUuid = dto.ownerUuid
    ownerAssociation.workspaceUuid = workspace.uuid
    ownerAssociation.createdAt = timestamp
    ownerAssociation.updatedAt = timestamp

    await this.workspaceUserRepository.save(ownerAssociation)

    return { workspace }
  }
}
