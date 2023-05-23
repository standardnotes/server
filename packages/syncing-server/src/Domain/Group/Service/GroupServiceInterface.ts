import { Group } from '../Model/Group'

export type CreateGroupDTO = {
  userUuid: string
  groupUuid: string
  groupKeyTimestamp: number
  specifiedItemsKeyUuid: string
}

export type UpdateGroupDTO = {
  originatorUuid: string
  groupUuid: string
  groupKeyTimestamp: number
  specifiedItemsKeyUuid: string
}

export interface GroupServiceInterface {
  createGroup(dto: CreateGroupDTO): Promise<Group | null>

  updateGroup(dto: UpdateGroupDTO): Promise<Group | null>

  deleteGroup(dto: { groupUuid: string; originatorUuid: string }): Promise<boolean>

  getGroup(dto: { groupUuid: string }): Promise<Group | null>

  getGroups(dto: { userUuid: string; lastSyncTime?: number }): Promise<Group[]>
}
