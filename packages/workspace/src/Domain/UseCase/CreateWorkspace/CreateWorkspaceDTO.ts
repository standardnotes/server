import { Uuid, WorkspaceType } from '@standardnotes/common'

export type CreateWorkspaceDTO = {
  ownerUuid: Uuid
  type: WorkspaceType
  encryptedWorkspaceKey?: string
  encryptedPrivateKey?: string
  publicKey?: string
  name?: string
}
