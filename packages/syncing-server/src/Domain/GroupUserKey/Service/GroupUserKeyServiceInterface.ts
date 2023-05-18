import { GroupUserKey } from '../Model/GroupUserKey'
import { GetUserGroupKeysDTO } from './GetUserGroupUserKeysDTO'

export interface GroupUserKeyServiceInterface {
  createGroupUserKey(dto: {
    originatorUuid: string
    groupUuid: string
    userUuid: string
    encryptedGroupKey: string
    senderUuid: string
    senderPublicKey: string
    permissions: string
  }): Promise<GroupUserKey | null>

  getGroupUserKeysForUser(dto: GetUserGroupKeysDTO): Promise<GroupUserKey[]>

  getGroupUsers(dto: {
    groupUuid: string
    originatorUuid: string
  }): Promise<{ users: GroupUserKey[]; isAdmin: boolean } | undefined>

  deleteGroupUserKey(dto: { originatorUuid: string; groupUuid: string; userUuid: string }): Promise<boolean>

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

  getUserKeysForUserBySender(dto: { userUuid: string; senderUuid: string }): Promise<GroupUserKey[]>
}
