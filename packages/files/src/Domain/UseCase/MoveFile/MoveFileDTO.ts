import { GroupMoveType } from '@standardnotes/security'

export type MoveFileDTO = {
  moveType: GroupMoveType
  fromUuid: string
  toUuid: string
  resourceRemoteIdentifier: string
}
