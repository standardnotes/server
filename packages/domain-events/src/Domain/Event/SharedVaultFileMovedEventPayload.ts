export interface SharedVaultFileMovedEventPayload {
  fileByteSize: number
  fileName: string
  from: {
    sharedVaultUuid?: string
    ownerUuid: string
    filePath: string
  }
  to: {
    sharedVaultUuid?: string
    ownerUuid: string
    filePath: string
  }
}
