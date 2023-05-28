import { ValetTokenOperation } from './ValetTokenOperation'

export type VaultValetTokenData = {
  vaultUuid: string
  permittedOperation: ValetTokenOperation
  remoteIdentifier: string
  unencryptedFileSize?: number
  uploadBytesUsed: number
  uploadBytesLimit: number
  moveOperation?: {
    type: 'vault-to-user' | 'user-to-vault'
    userUuid: string
  }
}
