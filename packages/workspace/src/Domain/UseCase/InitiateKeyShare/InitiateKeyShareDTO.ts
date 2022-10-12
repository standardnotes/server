import { Uuid } from '@standardnotes/common'

export type InitiateKeyShareDTO = {
  workspaceUuid: Uuid
  userUuid: Uuid
  performingUserUuid: Uuid
  encryptedWorkspaceKey: string
}
