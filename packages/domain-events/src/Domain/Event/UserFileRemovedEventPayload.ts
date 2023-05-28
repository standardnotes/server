export interface UserFileRemovedEventPayload {
  userUuid: string
  regularSubscriptionUuid: string
  fileByteSize: number
  filePath: string
  fileName: string
}
