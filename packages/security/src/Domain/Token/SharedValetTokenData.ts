import { ValetTokenOperation } from './ValetTokenOperation'

export type SharedValetTokenData = {
  sharingUserUuid: string
  permittedOperation: ValetTokenOperation.Read
  permittedResources: Array<{
    remoteIdentifier: string
    unencryptedFileSize?: number
  }>
}
