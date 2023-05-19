import { GroupUser } from '../Domain/GroupUser/Model/GroupUser'
import { ProjectorInterface } from './ProjectorInterface'
import { GroupUserProjection, GroupUserListingProjection } from './GroupUserProjection'

export class GroupUserProjector implements ProjectorInterface<GroupUser, GroupUserProjection> {
  projectSimple(_groupUser: GroupUser): GroupUserProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, groupUser: GroupUser): GroupUserProjection {
    const fullProjection = this.projectFull(groupUser)

    return {
      ...fullProjection,
      user_uuid: groupUser.userUuid,
    }
  }

  projectAsDisplayableUserForOtherGroupMembers(
    groupUser: GroupUser,
    isRequesterGroupAdmin: boolean,
  ): GroupUserListingProjection {
    return {
      uuid: groupUser.uuid,
      group_uuid: groupUser.groupUuid,
      user_uuid: groupUser.userUuid,
      permissions: isRequesterGroupAdmin ? groupUser.permissions : undefined,
      created_at_timestamp: groupUser.createdAtTimestamp,
      updated_at_timestamp: groupUser.updatedAtTimestamp,
    }
  }

  projectFull(groupUser: GroupUser): GroupUserProjection {
    return {
      uuid: groupUser.uuid,
      group_uuid: groupUser.groupUuid,
      user_uuid: groupUser.userUuid,
      inviter_uuid: groupUser.inviterUuid,
      permissions: groupUser.permissions,
      created_at_timestamp: groupUser.createdAtTimestamp,
      updated_at_timestamp: groupUser.updatedAtTimestamp,
    }
  }
}
