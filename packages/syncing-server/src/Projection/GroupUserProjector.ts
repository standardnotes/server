import { GroupUser } from '../Domain/GroupUser/Model/GroupKey'
import { ProjectorInterface } from './ProjectorInterface'
import { GroupUserProjection, GroupUserListingProjection } from './GroupUserProjection'

export class GroupUserProjector implements ProjectorInterface<GroupUser, GroupUserProjection> {
  projectSimple(_userKey: GroupUser): GroupUserProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, userKey: GroupUser): GroupUserProjection {
    const fullProjection = this.projectFull(userKey)

    return {
      ...fullProjection,
      user_uuid: userKey.userUuid,
    }
  }

  projectAsDisplayableUserForOtherGroupMembers(
    userKey: GroupUser,
    isRequesterGroupAdmin: boolean,
  ): GroupUserListingProjection {
    return {
      uuid: userKey.uuid,
      group_uuid: userKey.groupUuid,
      user_uuid: userKey.userUuid,
      permissions: isRequesterGroupAdmin ? userKey.permissions : undefined,
      created_at_timestamp: userKey.createdAtTimestamp,
      updated_at_timestamp: userKey.updatedAtTimestamp,
    }
  }

  projectFull(userKey: GroupUser): GroupUserProjection {
    return {
      uuid: userKey.uuid,
      group_uuid: userKey.groupUuid,
      user_uuid: userKey.userUuid,
      sender_uuid: userKey.senderUuid,
      sender_public_key: userKey.senderPublicKey,
      recipient_public_key: userKey.recipientPublicKey,
      encrypted_group_key: userKey.encryptedGroupKey,
      permissions: userKey.permissions,
      created_at_timestamp: userKey.createdAtTimestamp,
      updated_at_timestamp: userKey.updatedAtTimestamp,
    }
  }
}
