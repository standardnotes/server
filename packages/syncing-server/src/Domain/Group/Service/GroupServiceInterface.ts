import { GroupUser } from '../../GroupUser/Model/GroupUser'
import { Group } from '../Model/Group'

export interface GroupServiceInterface {
  createGroup(userUuid: string): Promise<Group | null>

  addUserToGroup(dto: {
    groupUuid: string
    ownerUuid: string
    inviteeUuid: string
    encryptedGroupKey: string
    senderPublicKey: string
  }): Promise<GroupUser | null>
}
