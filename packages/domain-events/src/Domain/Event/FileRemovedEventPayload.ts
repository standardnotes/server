import { Uuid } from '@standardnotes/common'

export interface FileRemovedEventPayload {
  userUuid: Uuid
  regularSubscriptionUuid: Uuid
  fileByteSize: number
  filePath: string
  fileName: string
}
