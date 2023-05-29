import { ValetTokenOperation } from './ValetTokenOperation'
import { VaultMoveType } from './VaultMoveType'

export type VaultValetTokenData = {
  vaultUuid: string
  permittedOperation: ValetTokenOperation
  remoteIdentifier: string
  unencryptedFileSize?: number
  uploadBytesUsed: number
  uploadBytesLimit: number
  moveOperation?: {
    type: VaultMoveType
    fromUuid: string
    toUuid: string
  }
}
