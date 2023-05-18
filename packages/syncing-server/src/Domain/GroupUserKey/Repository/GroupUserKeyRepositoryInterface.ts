import { GroupUserKey } from '../Model/GroupUserKey'

export type GroupUserKeyQuery = {
  userUuid: string
}

export type GroupUserKeyFindAllForUserQuery = {
  userUuid: string
  lastSyncTime?: number
}

export type GroupUserKeyFindAllForGroup = {
  groupUuid: string
}

export interface GroupUserKeyRepositoryInterface {
  findByUuid(groupUserUuid: string): Promise<GroupUserKey | null>
  create(group: GroupUserKey): Promise<GroupUserKey>
  save(groupUser: GroupUserKey): Promise<GroupUserKey>
  remove(group: GroupUserKey): Promise<GroupUserKey>
  findAllForUser(query: GroupUserKeyFindAllForUserQuery): Promise<GroupUserKey[]>
  findAllForGroup(query: GroupUserKeyFindAllForGroup): Promise<GroupUserKey[]>
  findByUserUuidAndGroupUuid(userUuid: string, groupUuid: string): Promise<GroupUserKey | null>
}
