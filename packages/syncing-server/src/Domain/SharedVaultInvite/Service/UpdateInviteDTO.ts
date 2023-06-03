import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'

export type UpdateInviteDTO = {
  originatorUuid: string
  inviteUuid: string
  inviterPublicKey: string
  encryptedVaultKeyContent: string
  permissions?: SharedVaultUserPermission
}
