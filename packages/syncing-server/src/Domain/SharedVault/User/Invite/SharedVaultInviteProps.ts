import { SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'

export interface SharedVaultInviteProps {
  sharedVaultUuid: Uuid
  userUuid: Uuid
  senderUuid: Uuid
  encryptedMessage: string
  permission: SharedVaultUserPermission
  timestamps: Timestamps
}
