import { ValetTokenOperation } from './ValetTokenOperation'
import { SharedVaultMoveType } from './SharedVaultMoveType'

export interface SharedVaultValetTokenData {
  sharedVaultUuid: string
  vaultOwnerUuid: string
  permittedOperation: ValetTokenOperation
  remoteIdentifier: string
  unencryptedFileSize?: number
  uploadBytesUsed: number
  uploadBytesLimit?: number
  moveOperation?: {
    type: SharedVaultMoveType
    from: {
      sharedVaultUuid?: string
      ownerUuid: string
    }
    to: {
      sharedVaultUuid?: string
      ownerUuid: string
    }
  }
}
