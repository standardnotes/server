import { Uuid, Timestamps } from '@standardnotes/domain-core'

export interface SharedVaultProps {
  userUuid: Uuid
  fileUploadBytesUsed: number
  timestamps: Timestamps
}
