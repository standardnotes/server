import { GroupInvite } from '../Model/GroupInvite'
import { GetUserGroupKeysDTO } from './GetUserGroupInvitesDTO'

export interface GroupInviteServiceInterface {
  createGroupInvite(dto: {
    originatorUuid: string
    groupUuid: string
    userUuid: string
    inviterUuid: string
    permissions: string
  }): Promise<GroupInvite | null>

  getGroupInvitesForUser(dto: GetUserGroupKeysDTO): Promise<GroupInvite[]>

  getGroupInvites(dto: {
    groupUuid: string
    originatorUuid: string
  }): Promise<{ users: GroupInvite[]; isAdmin: boolean } | undefined>

  deleteGroupInvite(dto: { originatorUuid: string; groupUuid: string; userUuid: string }): Promise<boolean>

  deleteAllGroupInvitesForGroup(dto: { originatorUuid: string; groupUuid: string }): Promise<boolean>
}
