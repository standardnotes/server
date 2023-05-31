import { ValetTokenOperation, GroupMoveType } from '@standardnotes/security'

export type CreateGroupFileValetTokenDTO = {
  userUuid: string
  groupUuid: string
  fileUuid?: string
  remoteIdentifier: string
  operation: ValetTokenOperation
  unencryptedFileSize?: number
  moveOperationType?: GroupMoveType
  groupToGroupMoveTargetUuid?: string
}
