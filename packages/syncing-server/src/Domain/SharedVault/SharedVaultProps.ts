import { Uuid, Timestamps } from '@standardnotes/domain-core'

import { SharedVaultItem } from './Item/SharedVaultItem'

export interface SharedVaultProps {
  userUuid: Uuid
  fileUploadBytesUsed: number
  fileUploadBytesLimit: number
  timestamps: Timestamps
  sharedVaultItems: SharedVaultItem[]
}
