export type FinishUploadSessionDTO = {
  ownerUuid: string
  ownerType: 'user' | 'shared-vault'
  resourceRemoteIdentifier: string
  uploadBytesUsed: number
  uploadBytesLimit: number
}
