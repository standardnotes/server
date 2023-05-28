export interface VaultFileRemovedEventPayload {
  vaultUuid: string
  fileByteSize: number
  filePath: string
  fileName: string
}
