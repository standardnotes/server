import { GroupUser } from './../../GroupUser/Model/GroupUser'
import { Group } from '../Model/Group'
import { Item } from '../../Item/Item'

export type CreateGroupDTO = {
  userUuid: string
  specifiedItemsKeyUuid: string
  vaultSystemIdentifier: string
}

export type CreateGroupResult = {
  group: Group
  groupUser: GroupUser
}

export type UpdateGroupDTO = {
  originatorUuid: string
  groupUuid: string
  specifiedItemsKeyUuid: string
}

export interface GroupServiceInterface {
  createGroup(dto: CreateGroupDTO): Promise<CreateGroupResult>
  updateGroup(dto: UpdateGroupDTO): Promise<Group | null>
  deleteGroup(dto: { groupUuid: string; originatorUuid: string }): Promise<boolean>

  getGroup(dto: { groupUuid: string }): Promise<Group | null>
  getGroups(dto: { userUuid: string; lastSyncTime?: number }): Promise<Group[]>

  addItemToGroup(dto: { itemUuid: string; groupUuid: string; originatorUuid: string }): Promise<Item | null>
  removeItemFromGroup(dto: { itemUuid: string; groupUuid: string; originatorUuid: string }): Promise<Item | null>
}
