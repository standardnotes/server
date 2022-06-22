import { Uuid } from '@standardnotes/common'

export type FinishUploadSessionDTO = {
  userUuid: Uuid
  resourceRemoteIdentifier: string
  uploadBytesUsed: number
  uploadBytesLimit: number
}
