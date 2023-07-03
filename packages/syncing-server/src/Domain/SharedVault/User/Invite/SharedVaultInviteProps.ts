import { Timestamps, Uuid } from '@standardnotes/domain-core'
import { SharedVaultUserPermission } from '../SharedVaultUserPermission'

export interface SharedVaultInviteProps {
  sharedVaultUuid: Uuid
  userUuid: Uuid
  senderUuid: Uuid
  encryptedMessage: string
  permission: SharedVaultUserPermission
  timestamps: Timestamps
}
