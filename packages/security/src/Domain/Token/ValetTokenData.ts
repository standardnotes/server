import { ValetTokenOperation } from './ValetTokenOperation'

export type ValetTokenData = {
  userUuid: string
  sharedSubscriptionUuid: string | undefined
  regularSubscriptionUuid: string
  permittedOperation: ValetTokenOperation
  permittedResources: Array<{
    remoteIdentifier: string
    unencryptedFileSize?: number
  }>
  uploadBytesUsed: number
  uploadBytesLimit: number
  ongoingTransition?: boolean
}
