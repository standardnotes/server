import { WorkspaceAccessLevel } from '@standardnotes/common'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { WorkspaceRepositoryInterface } from '../../Workspace/WorkspaceRepositoryInterface'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { ListWorkspaceUsersDTO } from './ListWorkspaceUsersDTO'
import { ListWorkspaceUsersResponse } from './ListWorkspaceUsersResponse'

@injectable()
export class ListWorkspaceUsers implements UseCaseInterface {
  constructor(
    @inject(TYPES.WorkspaceRepository) private workspaceRepository: WorkspaceRepositoryInterface,
    @inject(TYPES.WorkspaceUserRepository) private workspaceUserRepository: WorkspaceUserRepositoryInterface,
  ) {}

  async execute(dto: ListWorkspaceUsersDTO): Promise<ListWorkspaceUsersResponse> {
    const workspace = await this.workspaceRepository.findOneByUuid(dto.workspaceUuid)
    if (workspace === null) {
      return {
        workspaceUsers: [],
        userIsOwnerOrAdmin: false,
      }
    }

    const workspaceUsers = await this.workspaceUserRepository.findByWorkspaceUuid(dto.workspaceUuid)
    let userIsOwnerOrAdmin = false
    let userIsInWorkspace = false
    for (const workspaceUser of workspaceUsers) {
      if (workspaceUser.userUuid === dto.userUuid) {
        userIsInWorkspace = true
        if ([WorkspaceAccessLevel.Admin, WorkspaceAccessLevel.Owner].includes(workspaceUser.accessLevel)) {
          userIsOwnerOrAdmin = true
        }
      }
    }

    if (!userIsInWorkspace) {
      return {
        workspaceUsers: [],
        userIsOwnerOrAdmin: false,
      }
    }

    return {
      workspaceUsers,
      userIsOwnerOrAdmin,
    }
  }
}
