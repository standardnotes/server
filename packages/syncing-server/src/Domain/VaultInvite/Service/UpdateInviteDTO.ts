import { VaultUserPermission } from '../../VaultUser/Model/VaultUserPermission'

export type UpdateInviteDTO = {
  originatorUuid: string
  inviteUuid: string
  inviterPublicKey: string
  encryptedVaultData: string
  permissions?: VaultUserPermission
}
