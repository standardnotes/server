import { Uuid } from '@standardnotes/common'

import { ValetTokenOperation } from './ValetTokenOperation'

export type ValetTokenData = {
  userUuid: Uuid
  sharedSubscriptionUuid: Uuid | undefined
  regularSubscriptionUuid: Uuid
  permittedOperation: ValetTokenOperation
  permittedResources: Array<{
    remoteIdentifier: string
    unencryptedFileSize?: number
  }>
  uploadBytesUsed: number
  uploadBytesLimit: number
}
