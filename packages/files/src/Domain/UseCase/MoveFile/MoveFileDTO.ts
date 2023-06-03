import { SharedVaultMoveType } from '@standardnotes/security'

export type MoveFileDTO = {
  moveType: SharedVaultMoveType
  fromUuid: string
  toUuid: string
  resourceRemoteIdentifier: string
}
