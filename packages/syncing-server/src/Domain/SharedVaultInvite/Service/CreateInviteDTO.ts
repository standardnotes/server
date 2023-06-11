import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'

export type CreateInviteDTO = {
  recipientUuid: string
  sharedVaultUuid: string
  senderUuid: string
  encryptedMessage: string
  permissions: SharedVaultUserPermission
}
