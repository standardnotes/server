import { GroupInviteType } from '../Model/GroupInviteType'
import { GroupUserPermission } from '../../GroupUser/Model/GroupUserPermission'

export type CreateInviteDTO = {
  originatorUuid: string
  groupUuid: string
  userUuid: string
  inviterPublicKey: string
  encryptedGroupData: string
  inviteType: GroupInviteType
  permissions: GroupUserPermission
}
