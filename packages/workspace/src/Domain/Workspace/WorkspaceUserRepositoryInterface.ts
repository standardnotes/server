import { Uuid } from '@standardnotes/common'
import { WorkspaceUser } from './WorkspaceUser'

export interface WorkspaceUserRepositoryInterface {
  save(workspace: WorkspaceUser): Promise<WorkspaceUser>
  findByUserUuid(userUuid: Uuid): Promise<WorkspaceUser[]>
  findByWorkspaceUuid(workspaceUuid: Uuid): Promise<WorkspaceUser[]>
}
