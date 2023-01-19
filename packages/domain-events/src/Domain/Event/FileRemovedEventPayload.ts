export interface FileRemovedEventPayload {
  userUuid: string
  regularSubscriptionUuid: string
  fileByteSize: number
  filePath: string
  fileName: string
}
