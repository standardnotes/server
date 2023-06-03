import { SharedVaultInviteType } from '../Model/SharedVaultInviteType'
import { SharedVaultUserPermission } from '../../SharedVaultUser/Model/SharedVaultUserPermission'

export type CreateInviteDTO = {
  originatorUuid: string
  sharedVaultUuid: string
  userUuid: string
  inviterPublicKey: string
  encryptedVaultKeyContent: string
  inviteType: SharedVaultInviteType
  permissions: SharedVaultUserPermission
}
