import { ValetTokenOperation } from '@standardnotes/security'

export type CreateVaultFileValetTokenDTO = {
  userUuid: string
  vaultUuid: string
  fileUuid?: string
  remoteIdentifier: string
  operation: ValetTokenOperation
  moveOperationType?: 'vault-to-user' | 'user-to-vault'
  unencryptedFileSize?: number
}
