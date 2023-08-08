export interface SharedVaultFileUploadedEventPayload {
  sharedVaultUuid: string
  vaultOwnerUuid: string
  fileByteSize: number
  filePath: string
  fileName: string
}
