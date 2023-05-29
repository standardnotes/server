import { VaultMoveType } from '@standardnotes/security'

export type MoveFileDTO = {
  moveType: VaultMoveType
  fromUuid: string
  toUuid: string
  resourceRemoteIdentifier: string
}
