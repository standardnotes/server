import { WorkspaceUser } from './WorkspaceUser'

export interface WorkspaceUserRepositoryInterface {
  save(workspace: WorkspaceUser): Promise<WorkspaceUser>
  findByUserUuid(userUuid: string): Promise<WorkspaceUser[]>
  findByWorkspaceUuid(workspaceUuid: string): Promise<WorkspaceUser[]>
  findOneByUserUuidAndWorkspaceUuid(dto: { workspaceUuid: string; userUuid: string }): Promise<WorkspaceUser | null>
}
