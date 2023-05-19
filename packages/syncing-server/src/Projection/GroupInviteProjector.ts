import { GroupInvite } from '../Domain/GroupInvite/Model/GroupInvite'
import { ProjectorInterface } from './ProjectorInterface'
import { GroupInviteProjection } from './GroupInviteProjection'

export class GroupInviteProjector implements ProjectorInterface<GroupInvite, GroupInviteProjection> {
  projectSimple(_groupInvite: GroupInvite): GroupInviteProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, groupInvite: GroupInvite): GroupInviteProjection {
    const fullProjection = this.projectFull(groupInvite)

    return {
      ...fullProjection,
      user_uuid: groupInvite.userUuid,
    }
  }

  projectFull(groupInvite: GroupInvite): GroupInviteProjection {
    return {
      uuid: groupInvite.uuid,
      group_uuid: groupInvite.groupUuid,
      user_uuid: groupInvite.userUuid,
      inviter_uuid: groupInvite.inviterUuid,
      created_at_timestamp: groupInvite.createdAtTimestamp,
      updated_at_timestamp: groupInvite.updatedAtTimestamp,
    }
  }
}
