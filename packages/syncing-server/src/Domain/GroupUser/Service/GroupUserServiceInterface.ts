import { GroupUser } from '../Model/GroupKey'
import { GetUserGroupKeysDTO } from './GetUserGroupUsersDTO'

export interface GroupUserServiceInterface {
  createGroupUser(dto: {
    originatorUuid: string
    groupUuid: string
    userUuid: string
    senderUuid: string
    senderPublicKey: string
    recipientPublicKey: string
    encryptedGroupKey: string
    permissions: string
  }): Promise<GroupUser | null>

  getGroupUsersForUser(dto: GetUserGroupKeysDTO): Promise<GroupUser[]>

  getGroupUsers(dto: {
    groupUuid: string
    originatorUuid: string
  }): Promise<{ users: GroupUser[]; isAdmin: boolean } | undefined>

  deleteGroupUser(dto: { originatorUuid: string; groupUuid: string; userUuid: string }): Promise<boolean>

  updateAllGroupUsersForCurrentUser(dto: {
    userUuid: string
    updatedKeys: {
      uuid: string
      encryptedGroupKey: string
      senderPublicKey: string
      recipientPublicKey: string
    }[]
  }): Promise<boolean>

  updateGroupUsersForAllMembers(dto: {
    originatorUuid: string
    groupUuid: string
    updatedKeys: {
      userUuid: string
      encryptedGroupKey: string
      senderPublicKey: string
    }[]
  }): Promise<boolean>

  deleteAllGroupUsersForGroup(dto: { originatorUuid: string; groupUuid: string }): Promise<boolean>

  getAllUserKeysForUser(dto: { userUuid: string }): Promise<GroupUser[]>

  getUserKeysForUserBySender(dto: { userUuid: string; senderUuid: string }): Promise<GroupUser[]>
}
