import { WorkspaceInvite } from './WorkspaceInvite'

export interface WorkspaceInviteRepositoryInterface {
  findOneByUuid(uuid: string): Promise<WorkspaceInvite | null>
  save(workspace: WorkspaceInvite): Promise<WorkspaceInvite>
}
