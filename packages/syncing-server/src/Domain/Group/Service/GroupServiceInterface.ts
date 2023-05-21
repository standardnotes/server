import { Group } from '../Model/Group'

export interface GroupServiceInterface {
  createGroup(dto: { userUuid: string; specifiedItemsKeyUuid: string }): Promise<Group | null>

  updateGroup(dto: { groupUuid: string; originatorUuid: string; specifiedItemsKeyUuid: string }): Promise<Group | null>

  deleteGroup(dto: { groupUuid: string; originatorUuid: string }): Promise<boolean>

  getGroup(dto: { groupUuid: string }): Promise<Group | null>

  getGroups(dto: { userUuid: string; lastSyncTime?: number }): Promise<Group[]>
}
