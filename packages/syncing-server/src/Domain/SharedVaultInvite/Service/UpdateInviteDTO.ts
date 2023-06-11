import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'

export type UpdateInviteDTO = {
  inviteUuid: string
  senderUuid: string
  encryptedMessage: string
  permissions?: SharedVaultUserPermission
}
