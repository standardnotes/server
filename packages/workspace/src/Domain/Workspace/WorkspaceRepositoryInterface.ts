import { Workspace } from './Workspace'

export interface WorkspaceRepositoryInterface {
  save(workspace: Workspace): Promise<Workspace>
  findByUuids(uuids: string[]): Promise<Workspace[]>
  findOneByUuid(uuid: string): Promise<Workspace | null>
}
