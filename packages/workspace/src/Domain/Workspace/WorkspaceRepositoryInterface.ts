import { Uuid } from '@standardnotes/common'
import { Workspace } from './Workspace'

export interface WorkspaceRepositoryInterface {
  save(workspace: Workspace): Promise<Workspace>
  findByUuids(uuids: Uuid[]): Promise<Workspace[]>
  findOneByUuid(uuid: Uuid): Promise<Workspace | null>
}
