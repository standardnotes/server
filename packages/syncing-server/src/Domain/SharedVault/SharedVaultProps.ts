import { Uuid, Timestamps } from '@standardnotes/domain-core'

export interface SharedVaultProps {
  userUuid: Uuid
  fileUploadBytesUsed: number
  fileUploadBytesLimit: number
  timestamps: Timestamps
}
