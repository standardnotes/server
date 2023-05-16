import { GroupUserKey } from '../../GroupUserKey/Model/GroupUserKey'
import { Group } from '../Model/Group'

export interface GroupServiceInterface {
  createGroup(userUuid: string): Promise<Group | null>

  addUserToGroup(dto: {
    groupUuid: string
    ownerUuid: string
    inviteeUuid: string
    encryptedGroupKey: string
    senderPublicKey: string
  }): Promise<GroupUserKey | null>
}
