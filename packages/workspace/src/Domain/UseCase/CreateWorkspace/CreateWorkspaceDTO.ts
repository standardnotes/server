import { Uuid, WorkspaceType } from '@standardnotes/common'

export type CreateWorkspaceDTO = {
  ownerUuid: Uuid
  encryptedWorkspaceKey: string
  encryptedPrivateKey: string
  publicKey: string
  type: WorkspaceType
  name?: string
}
