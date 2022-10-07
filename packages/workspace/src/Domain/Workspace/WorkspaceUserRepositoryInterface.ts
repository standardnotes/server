import { WorkspaceUser } from './WorkspaceUser'

export interface WorkspaceUserRepositoryInterface {
  save(workspace: WorkspaceUser): Promise<WorkspaceUser>
}
