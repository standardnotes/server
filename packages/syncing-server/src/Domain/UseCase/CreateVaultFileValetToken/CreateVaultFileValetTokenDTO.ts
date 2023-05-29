import { ValetTokenOperation, VaultMoveType } from '@standardnotes/security'

export type CreateVaultFileValetTokenDTO = {
  userUuid: string
  vaultUuid: string
  fileUuid?: string
  remoteIdentifier: string
  operation: ValetTokenOperation
  unencryptedFileSize?: number
  moveOperationType?: VaultMoveType
  vaultToVaultMoveTargetUuid?: string
}
