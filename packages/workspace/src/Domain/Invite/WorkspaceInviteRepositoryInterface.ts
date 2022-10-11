import { Uuid } from '@standardnotes/common'

import { WorkspaceInvite } from './WorkspaceInvite'

export interface WorkspaceInviteRepositoryInterface {
  findOneByUuid(uuid: Uuid): Promise<WorkspaceInvite | null>
  save(workspace: WorkspaceInvite): Promise<WorkspaceInvite>
}
