import { SharedVaultMoveType, ValetTokenOperation } from '@standardnotes/security'

export interface CreateSharedVaultFileValetTokenDTO {
  userUuid: string
  sharedVaultUuid: string
  sharedVaultOwnerUploadBytesLimit?: number
  fileUuid?: string
  remoteIdentifier: string
  operation: ValetTokenOperation
  unencryptedFileSize?: number
  moveOperationType?: SharedVaultMoveType
  sharedVaultToSharedVaultMoveTargetUuid?: string
  sharedVaultToSharedVaultMoveTargetOwnerUuid?: string
}
