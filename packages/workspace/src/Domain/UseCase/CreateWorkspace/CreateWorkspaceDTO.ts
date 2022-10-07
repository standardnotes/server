import { Uuid } from '@standardnotes/common'

import { WorkspaceType } from '../../Workspace/WorkspaceType'

export type CreateWorkspaceDTO = {
  ownerUuid: Uuid
  encryptedWorkspaceKey: string
  encryptedPrivateKey: string
  publicKey: string
  name?: string
  type: WorkspaceType
}
