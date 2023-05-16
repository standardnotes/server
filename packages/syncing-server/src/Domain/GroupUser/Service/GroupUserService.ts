import { GetUserGroupKeysDTO } from './GetUserGroupKeysDTO'
import { GroupUser } from '../Model/GroupUser'

export interface GroupUserServiceInterface {
  createGroupUser(dto: {
    groupUuid: string
    userUuid: string
    encryptedGroupKey: string
    senderPublicKey: string
  }): Promise<GroupUser>
  getUsersForGroup(groupUuid: string): Promise<GroupUser[]>
  getUserGroupKeys(dto: GetUserGroupKeysDTO): Promise<GroupUser[]>
}

export class GroupUserService implements GroupUserServiceInterface {
  createGroupUser(dto: {
    groupUuid: string
    userUuid: string
    encryptedGroupKey: string
    senderPublicKey: string
  }): Promise<GroupUser> {}

  getUsersForGroup(groupUuid: string): Promise<GroupUser[]> {}

  getUserGroupKeys(dto: GetUserGroupKeysDTO): Promise<GroupUser[]> {}
}
