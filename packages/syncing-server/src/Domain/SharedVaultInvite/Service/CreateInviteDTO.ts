import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'

export type CreateInviteDTO = {
  originatorUuid: string
  sharedVaultUuid: string
  userUuid: string
  inviterPublicKey: string
  encryptedVaultKeyContent: string
  permissions: SharedVaultUserPermission
}
