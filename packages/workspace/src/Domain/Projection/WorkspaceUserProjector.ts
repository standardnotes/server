import { injectable } from 'inversify'
import { ProjectorInterface } from './ProjectorInterface'

import { WorkspaceUserProjection } from './WorkspaceUserProjection'
import { WorkspaceUser } from '../Workspace/WorkspaceUser'

@injectable()
export class WorkspaceUserProjector implements ProjectorInterface<WorkspaceUser, WorkspaceUserProjection> {
  async project(workspaceUser: WorkspaceUser): Promise<WorkspaceUserProjection> {
    return {
      uuid: workspaceUser.uuid,
      accessLevel: workspaceUser.accessLevel,
      userUuid: workspaceUser.userUuid,
      userDisplayName: workspaceUser.userDisplayName,
      workspaceUuid: workspaceUser.workspaceUuid,
      encryptedWorkspaceKey: workspaceUser.encryptedWorkspaceKey,
      publicKey: workspaceUser.publicKey,
      encryptedPrivateKey: workspaceUser.encryptedPrivateKey,
      status: workspaceUser.status,
      keyRotationIndex: workspaceUser.keyRotationIndex,
      createdAt: workspaceUser.createdAt,
      updatedAt: workspaceUser.updatedAt,
    }
  }
}
