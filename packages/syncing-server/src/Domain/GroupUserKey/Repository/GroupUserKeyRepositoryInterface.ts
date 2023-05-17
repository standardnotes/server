import { GroupUserKey } from '../Model/GroupUserKey'

export type GroupUserKeyQuery = {
  userUuid: string
}

export type GroupUserKeyFindAllQuery = {
  userUuid: string
  lastSyncTime?: number
}

export interface GroupUserKeyRepositoryInterface {
  findByUuid(groupUserUuid: string): Promise<GroupUserKey | null>
  create(group: GroupUserKey): Promise<GroupUserKey>
  remove(group: GroupUserKey): Promise<GroupUserKey>
  findAll(query: GroupUserKeyFindAllQuery): Promise<GroupUserKey[]>
}
