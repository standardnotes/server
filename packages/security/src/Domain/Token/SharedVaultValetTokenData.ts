import { ValetTokenOperation } from './ValetTokenOperation'
import { SharedVaultMoveType } from './SharedVaultMoveType'

export type SharedVaultValetTokenData = {
  sharedVaultUuid: string
  permittedOperation: ValetTokenOperation
  remoteIdentifier: string
  unencryptedFileSize?: number
  uploadBytesUsed: number
  uploadBytesLimit: number
  moveOperation?: {
    type: SharedVaultMoveType
    fromUuid: string
    toUuid: string
  }
}
