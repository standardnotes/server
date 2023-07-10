import { SharedVaultMoveType, ValetTokenOperation } from '@standardnotes/security'

export interface CreateSharedVaultFileValetTokenDTO {
  userUuid: string
  sharedVaultUuid: string
  fileUuid?: string
  remoteIdentifier: string
  operation: ValetTokenOperation
  unencryptedFileSize?: number
  moveOperationType?: SharedVaultMoveType
  sharedVaultToSharedVaultMoveTargetUuid?: string
}
