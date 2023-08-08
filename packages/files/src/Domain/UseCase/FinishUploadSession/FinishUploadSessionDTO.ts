export type FinishUploadSessionDTO = {
  userUuid: string
  sharedVaultUuid?: string
  resourceRemoteIdentifier: string
  uploadBytesUsed: number
  uploadBytesLimit: number
}
