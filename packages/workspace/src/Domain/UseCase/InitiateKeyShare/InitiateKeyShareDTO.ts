import { Uuid } from '@standardnotes/common'

export type InitiateKeyShareDTO = {
  workspaceUuid: Uuid
  userUuid: Uuid
  encryptedWorkspaceKey: string
}
