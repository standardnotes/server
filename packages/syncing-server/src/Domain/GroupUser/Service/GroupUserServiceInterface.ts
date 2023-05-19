import { GroupUser } from '../Model/GroupUser'
import { GetUserGroupKeysDTO } from './GetUserGroupUsersDTO'

export interface GroupUserServiceInterface {
  createGroupUser(dto: {
    originatorUuid: string
    groupUuid: string
    userUuid: string
    permissions: string
  }): Promise<GroupUser | null>

  getGroupUsersForUser(dto: GetUserGroupKeysDTO): Promise<GroupUser[]>

  getGroupUsers(dto: {
    groupUuid: string
    originatorUuid: string
  }): Promise<{ users: GroupUser[]; isAdmin: boolean } | undefined>

  deleteGroupUser(dto: { originatorUuid: string; groupUuid: string; userUuid: string }): Promise<boolean>

  deleteAllGroupUsersForGroup(dto: { originatorUuid: string; groupUuid: string }): Promise<boolean>
}
