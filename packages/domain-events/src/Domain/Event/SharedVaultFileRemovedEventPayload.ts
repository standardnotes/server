export interface SharedVaultFileRemovedEventPayload {
  sharedVaultUuid: string
  vaultOwnerUuid: string
  fileByteSize: number
  filePath: string
  fileName: string
}
