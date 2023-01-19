export type FinishUploadSessionDTO = {
  userUuid: string
  resourceRemoteIdentifier: string
  uploadBytesUsed: number
  uploadBytesLimit: number
}
