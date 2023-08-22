import { SharedVaultMoveType } from '@standardnotes/security'

export interface MoveFileDTO {
  moveType: SharedVaultMoveType
  from: {
    sharedVaultUuid?: string
    ownerUuid: string
  }
  to: {
    sharedVaultUuid?: string
    ownerUuid: string
  }
  resourceRemoteIdentifier: string
}
