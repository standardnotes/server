import { GroupUserKey } from '../Model/GroupUserKey'
import { GetUserGroupKeysDTO } from './GetUserGroupUserKeysDTO'

export interface GroupUserKeyServiceInterface {
  createGroupUserKey(dto: {
    groupUuid: string
    userUuid: string
    encryptedGroupKey: string
    senderPublicKey: string
    permissions: string
  }): Promise<GroupUserKey>

  getGroupUserKeysForUser(dto: GetUserGroupKeysDTO): Promise<GroupUserKey[]>
}
