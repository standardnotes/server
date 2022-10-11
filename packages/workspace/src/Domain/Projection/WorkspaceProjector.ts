import { injectable } from 'inversify'
import { ProjectorInterface } from './ProjectorInterface'

import { WorkspaceProjection } from './WorkspaceProjection'
import { Workspace } from '../Workspace/Workspace'

@injectable()
export class WorkspaceProjector implements ProjectorInterface<Workspace, WorkspaceProjection> {
  async project(workspace: Workspace): Promise<WorkspaceProjection> {
    return {
      uuid: workspace.uuid,
      type: workspace.type,
      name: workspace.name,
      keyRotationIndex: workspace.keyRotationIndex,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    }
  }
}
