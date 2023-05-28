import { VaultInviteType } from '../Model/VaultInviteType'
import { VaultUserPermission } from '../../VaultUser/Model/VaultUserPermission'

export type CreateInviteDTO = {
  originatorUuid: string
  vaultUuid: string
  userUuid: string
  inviterPublicKey: string
  encryptedVaultData: string
  inviteType: VaultInviteType
  permissions: VaultUserPermission
}
