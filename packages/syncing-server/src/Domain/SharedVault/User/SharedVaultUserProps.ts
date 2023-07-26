import { SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'

export interface SharedVaultUserProps {
  sharedVaultUuid: Uuid
  userUuid: Uuid
  permission: SharedVaultUserPermission
  timestamps: Timestamps
}
