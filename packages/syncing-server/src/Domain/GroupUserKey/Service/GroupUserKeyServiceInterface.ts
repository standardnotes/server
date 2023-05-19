import { GroupUserKey } from '../Model/GroupUserKey'
import { GetUserGroupKeysDTO } from './GetUserGroupUserKeysDTO'

export interface GroupUserKeyServiceInterface {
  createGroupUserKey(dto: {
    originatorUuid: string
    groupUuid: string
    userUuid: string
    senderUuid: string
    senderPublicKey: string
    recipientPublicKey: string
    encryptedGroupKey: string
    permissions: string
  }): Promise<GroupUserKey | null>

  getGroupUserKeysForUser(dto: GetUserGroupKeysDTO): Promise<GroupUserKey[]>

  getGroupUsers(dto: {
    groupUuid: string
    originatorUuid: string
  }): Promise<{ users: GroupUserKey[]; isAdmin: boolean } | undefined>

  deleteGroupUserKey(dto: { originatorUuid: string; groupUuid: string; userUuid: string }): Promise<boolean>

  updateAllGroupUserKeysForCurrentUser(dto: {
    userUuid: string
    updatedKeys: {
      uuid: string
      encryptedGroupKey: string
      senderPublicKey: string
      recipientPublicKey: string
    }[]
  }): Promise<boolean>

  updateGroupUserKeysForAllMembers(dto: {
    originatorUuid: string
    groupUuid: string
    updatedKeys: {
      userUuid: string
      encryptedGroupKey: string
      senderPublicKey: string
    }[]
  }): Promise<boolean>

  deleteAllGroupUserKeysForGroup(dto: { originatorUuid: string; groupUuid: string }): Promise<boolean>

  getAllUserKeysForUser(dto: { userUuid: string }): Promise<GroupUserKey[]>

  getUserKeysForUserBySender(dto: { userUuid: string; senderUuid: string }): Promise<GroupUserKey[]>
}
