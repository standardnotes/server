import { WorkspaceAccessLevel } from '@standardnotes/common'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { Workspace } from '../../Workspace/Workspace'
import { WorkspaceRepositoryInterface } from '../../Workspace/WorkspaceRepositoryInterface'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'

import { ListWorkspacesDTO } from './ListWorkspacesDTO'
import { ListWorkspacesResponse } from './ListWorkspacesResponse'

@injectable()
export class ListWorkspaces implements UseCaseInterface {
  constructor(
    @inject(TYPES.WorkspaceRepository) private workspaceRepository: WorkspaceRepositoryInterface,
    @inject(TYPES.WorkspaceUserRepository) private workspaceUserRepository: WorkspaceUserRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: ListWorkspacesDTO): Promise<ListWorkspacesResponse> {
    this.logger.debug(`Listing workspaces for user ${dto.userUuid}`)

    const workspaceAssociations = await this.workspaceUserRepository.findByUserUuid(dto.userUuid)

    const ownedWorkspacesUuids = []
    const joinedWorkspacesUuids = []
    for (const workspaceAssociation of workspaceAssociations) {
      if ([WorkspaceAccessLevel.Admin, WorkspaceAccessLevel.Owner].includes(workspaceAssociation.accessLevel)) {
        ownedWorkspacesUuids.push(workspaceAssociation.uuid)
      } else {
        joinedWorkspacesUuids.push(workspaceAssociation.uuid)
      }
    }

    this.logger.debug(`Owned workspaces uuids: ${JSON.stringify(ownedWorkspacesUuids)}`)
    this.logger.debug(`Joined workspaces uuids: ${JSON.stringify(joinedWorkspacesUuids)}`)

    let ownedWorkspaces: Array<Workspace> = []
    if (ownedWorkspacesUuids.length > 0) {
      ownedWorkspaces = await this.workspaceRepository.findByUuids(ownedWorkspacesUuids)
    }
    let joinedWorkspaces: Array<Workspace> = []
    if (joinedWorkspacesUuids.length > 0) {
      joinedWorkspaces = await this.workspaceRepository.findByUuids(joinedWorkspacesUuids)
    }

    this.logger.debug(
      `Found workspaces for user ${dto.userUuid}: ${JSON.stringify({
        ownedWorkspaces,
        joinedWorkspaces,
      })}`,
    )

    return {
      ownedWorkspaces,
      joinedWorkspaces,
    }
  }
}
