import { Workspace } from './Workspace'

export interface WorkspaceRepositoryInterface {
  save(workspace: Workspace): Promise<Workspace>
}
