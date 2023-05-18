import { Group } from '../Model/Group'

export interface GroupServiceInterface {
  createGroup(dto: { userUuid: string; encryptedGroupKey: string; creatorPublicKey: string }): Promise<Group | null>

  deleteGroup(dto: { groupUuid: string; originatorUuid: string }): Promise<boolean>
}
