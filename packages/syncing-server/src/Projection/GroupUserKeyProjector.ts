import { GroupUserKey } from './../Domain/GroupUserKey/Model/GroupUserKey'
import { ProjectorInterface } from './ProjectorInterface'
import { GroupUserKeyProjection } from './GroupUserKeyProjection'

export class GroupUserKeyProjector implements ProjectorInterface<GroupUserKey, GroupUserKeyProjection> {
  async projectSimple(_userKey: GroupUserKey): Promise<GroupUserKeyProjection> {
    throw Error('not implemented')
  }

  async projectCustom(_projectionType: string, userKey: GroupUserKey): Promise<GroupUserKeyProjection> {
    const fullProjection = await this.projectFull(userKey)

    return {
      ...fullProjection,
      user_uuid: userKey.userUuid,
    }
  }

  async projectFull(userKey: GroupUserKey): Promise<GroupUserKeyProjection> {
    return {
      uuid: userKey.uuid,
      group_uuid: userKey.groupUuid,
      user_uuid: userKey.userUuid,
      encrypted_group_key: userKey.encryptedGroupKey,
      sender_public_key: userKey.senderPublicKey,
      created_at_timestamp: userKey.createdAtTimestamp,
      updated_at_timestamp: userKey.updatedAtTimestamp,
    }
  }
}
