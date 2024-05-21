import { ValetTokenOperation } from '@standardnotes/security'

export interface ValetTokenResponseLocals {
  valetToken: string
  userUuid: string
  permittedResources: Array<{
    remoteIdentifier: string
    unencryptedFileSize?: number
  }>
  permittedOperation: ValetTokenOperation
  uploadBytesUsed: number
  uploadBytesLimit: number
  regularSubscriptionUuid: string
}
