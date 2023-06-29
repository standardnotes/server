import { SharedVaultMoveType } from '@standardnotes/security'

export interface MoveFileDTO {
  moveType: SharedVaultMoveType
  fromUuid: string
  toUuid: string
  resourceRemoteIdentifier: string
}
