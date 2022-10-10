import { WorkspaceInvite } from './WorkspaceInvite'

export interface WorkspaceInviteRepositoryInterface {
  save(workspace: WorkspaceInvite): Promise<WorkspaceInvite>
}
