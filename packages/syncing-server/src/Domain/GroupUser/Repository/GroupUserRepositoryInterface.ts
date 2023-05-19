import { GroupUser } from '../Model/GroupUser'

export type GroupUserQuery = {
  userUuid: string
}

export type GroupUserFindAllForUserQuery = {
  userUuid: string
  lastSyncTime?: number
  inviterUuid?: string
  includeSentAndReceived?: boolean
}

export type GroupUserFindAllForGroup = {
  groupUuid: string
}

export interface GroupUserRepositoryInterface {
  findByUuid(groupUserUuid: string): Promise<GroupUser | null>
  create(group: GroupUser): Promise<GroupUser>
  save(groupUser: GroupUser): Promise<GroupUser>
  remove(group: GroupUser): Promise<GroupUser>
  findAllForUser(query: GroupUserFindAllForUserQuery): Promise<GroupUser[]>
  findAllForGroup(query: GroupUserFindAllForGroup): Promise<GroupUser[]>
  findByUserUuidAndGroupUuid(userUuid: string, groupUuid: string): Promise<GroupUser | null>
}
