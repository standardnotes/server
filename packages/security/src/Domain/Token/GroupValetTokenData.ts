import { ValetTokenOperation } from './ValetTokenOperation'
import { GroupMoveType } from './GroupMoveType'

export type GroupValetTokenData = {
  groupUuid: string
  permittedOperation: ValetTokenOperation
  remoteIdentifier: string
  unencryptedFileSize?: number
  uploadBytesUsed: number
  uploadBytesLimit: number
  moveOperation?: {
    type: GroupMoveType
    fromUuid: string
    toUuid: string
  }
}
