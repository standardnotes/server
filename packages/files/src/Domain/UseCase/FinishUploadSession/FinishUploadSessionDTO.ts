export type FinishUploadSessionDTO = {
  ownerUuid: string
  ownerType: 'user' | 'group'
  resourceRemoteIdentifier: string
  uploadBytesUsed: number
  uploadBytesLimit: number
}
