import { ValetTokenOperation, SharedVaultMoveType } from '@standardnotes/security'

export type CreateSharedVaultFileValetTokenDTO = {
  userUuid: string
  sharedVaultUuid: string
  fileUuid?: string
  remoteIdentifier: string
  operation: ValetTokenOperation
  unencryptedFileSize?: number
  moveOperationType?: SharedVaultMoveType
  sharedVaultToSharedVaultMoveTargetUuid?: string
}
