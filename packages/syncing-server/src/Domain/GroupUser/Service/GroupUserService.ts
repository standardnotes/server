import { GroupUser } from '../Model/GroupUser'

export interface GroupUserServiceInterface {
  createGroupUser(groupUuid: string, userUuid: string, encryptedGroupKey: string): Promise<GroupUser>
  getGroupUsers(groupUuid: string): Promise<GroupUser[]>
}

export class GroupUserService implements GroupUserServiceInterface {
  createGroupUser(groupUuid: string, userUuid: string, encryptedGroupKey: string): Promise<GroupUser> {}

  getGroupUsers(groupUuid: string): Promise<GroupUser[]> {}
}
