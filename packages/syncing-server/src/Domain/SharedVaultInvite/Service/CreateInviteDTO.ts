import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'

export type CreateInviteDTO = {
  userUuid: string
  sharedVaultUuid: string
  senderUuid: string
  senderPublicKey: string
  encryptedMessage: string
  permissions: SharedVaultUserPermission
}
