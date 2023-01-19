import { WorkspaceType } from '@standardnotes/common'

export type CreateWorkspaceDTO = {
  ownerUuid: string
  type: WorkspaceType
  encryptedWorkspaceKey?: string
  encryptedPrivateKey?: string
  publicKey?: string
  name?: string
}
