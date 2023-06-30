import { Timestamps, Uuid } from '@standardnotes/domain-core'

import { SharedVaultUserPermission } from './SharedVaultUserPermission'

export interface SharedVaultUserProps {
  sharedVaultUuid: Uuid
  userUuid: Uuid
  permission: SharedVaultUserPermission
  timestamps: Timestamps
}
