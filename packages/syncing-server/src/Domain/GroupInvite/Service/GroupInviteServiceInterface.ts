import { GroupInvite } from '../Model/GroupInvite'
import { GroupInviteType } from '../Model/GroupInviteType'
import { GetUserGroupInvitesDTO } from './GetUserGroupInvitesDTO'

export interface GroupInviteServiceInterface {
  createGroupInvite(dto: {
    originatorUuid: string
    groupUuid: string
    userUuid: string
    inviterPublicKey: string
    encryptedGroupKey: string
    inviteType: GroupInviteType
    permissions: string
  }): Promise<GroupInvite | null>

  getGroupInvitesForUser(dto: GetUserGroupInvitesDTO): Promise<GroupInvite[]>

  getGroupInvitesForGroup(dto: { groupUuid: string; originatorUuid: string }): Promise<GroupInvite[] | undefined>

  acceptGroupInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean>

  declineGroupInvite(dto: { originatorUuid: string; inviteUuid: string }): Promise<boolean>

  deleteGroupInvite(dto: { originatorUuid: string; groupUuid: string; inviteUuid: string }): Promise<boolean>

  deleteAllGroupInvitesForGroup(dto: { originatorUuid: string; groupUuid: string }): Promise<boolean>
}
