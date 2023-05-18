import { GroupUserKey } from './../Domain/GroupUserKey/Model/GroupUserKey'
import { ProjectorInterface } from './ProjectorInterface'
import { GroupUserKeyProjection } from './GroupUserKeyProjection'

export class GroupUserKeyProjector implements ProjectorInterface<GroupUserKey, GroupUserKeyProjection> {
  projectSimple(_userKey: GroupUserKey): GroupUserKeyProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, userKey: GroupUserKey): GroupUserKeyProjection {
    const fullProjection = this.projectFull(userKey)

    return {
      ...fullProjection,
      user_uuid: userKey.userUuid,
    }
  }

  projectAsDisplayableUserForOtherGroupMembers(
    userKey: GroupUserKey,
    isRequesterGroupAdmin: boolean,
  ): GroupUserKeyProjection {
    return {
      uuid: userKey.uuid,
      group_uuid: userKey.groupUuid,
      user_uuid: userKey.userUuid,
      permissions: isRequesterGroupAdmin ? userKey.permissions : undefined,
      created_at_timestamp: userKey.createdAtTimestamp,
      updated_at_timestamp: userKey.updatedAtTimestamp,
    }
  }

  projectFull(userKey: GroupUserKey): GroupUserKeyProjection {
    return {
      uuid: userKey.uuid,
      group_uuid: userKey.groupUuid,
      user_uuid: userKey.userUuid,
      encrypted_group_key: userKey.encryptedGroupKey,
      sender_public_key: userKey.senderPublicKey,
      permissions: userKey.permissions,
      created_at_timestamp: userKey.createdAtTimestamp,
      updated_at_timestamp: userKey.updatedAtTimestamp,
    }
  }
}
