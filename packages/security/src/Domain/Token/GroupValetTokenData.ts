import { ValetTokenOperation } from './ValetTokenOperation'

export type GroupValetTokenData = {
  fileOwnerUuid: string
  groupUuid: string
  permittedOperation: ValetTokenOperation.Read
  remoteIdentifier: string
}
