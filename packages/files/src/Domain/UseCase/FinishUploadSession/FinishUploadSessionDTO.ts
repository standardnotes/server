export type FinishUploadSessionDTO = {
  ownerUuid: string
  ownerType: 'user' | 'vault'
  resourceRemoteIdentifier: string
  uploadBytesUsed: number
  uploadBytesLimit: number
}
