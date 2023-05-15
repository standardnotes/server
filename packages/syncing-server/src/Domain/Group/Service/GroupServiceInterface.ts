import { GroupUser } from '../../GroupUser/Model/GroupUser'
import { Group } from '../Model/Group'

export interface GroupServiceInterface {
  createGroup(userUuid: string): Promise<Group | null>

  addUserToGroup(dto: {
    groupUuid: string
    ownerUuid: string
    inviteeUuid: string
    encryptedGroupKey: string
  }): Promise<GroupUser | null>

  addItemToGroup(dto: {
    groupUuid: string
    userUuid: string
    itemUuid: string
    apiVersion: string
    readOnlyAccess: boolean
    sessionUuid: string | null
  }): Promise<{ success: boolean }>

  getGroup(groupUuid: string): Promise<Group | null>

  getUserGroups(userUuid: string): Promise<Group[]>
}
