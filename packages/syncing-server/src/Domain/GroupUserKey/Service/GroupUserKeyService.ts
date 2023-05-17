import { TimerInterface } from '@standardnotes/time'
import { GroupUserKey } from '../Model/GroupUserKey'
import { GroupUserKeyFactoryInterface } from '../GroupUserKeyFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { GroupUserKeyRepositoryInterface } from '../Repository/GroupUserKeyRepositoryInterface'
import { GroupUserKeyServiceInterface } from './GroupUserKeyServiceInterface'

export class GroupUserKeyService implements GroupUserKeyServiceInterface {
  constructor(
    private groupUserRepository: GroupUserKeyRepositoryInterface,
    private groupUserFactory: GroupUserKeyFactoryInterface,
    private timer: TimerInterface,
  ) {}

  createGroupUserKey(dto: {
    groupUuid: string
    userUuid: string
    encryptedGroupKey: string
    senderPublicKey: string
    permissions: string
  }): Promise<GroupUserKey> {
    const groupUser = this.groupUserFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      group_uuid: dto.groupUuid,
      encrypted_group_key: dto.encryptedGroupKey,
      sender_public_key: dto.senderPublicKey,
      permissions: dto.permissions,
      created_at_timestamp: this.timer.getTimestampInSeconds(),
      updated_at_timestamp: this.timer.getTimestampInSeconds(),
    })

    return this.groupUserRepository.create(groupUser)
  }

  getGroupUserKeysForUser(dto: { userUuid: string }): Promise<GroupUserKey[]> {
    return this.groupUserRepository.findAll({ userUuid: dto.userUuid })
  }
}
