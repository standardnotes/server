import { Group } from './../Domain/Group/Model/Group'
import { ProjectorInterface } from './ProjectorInterface'
import { GroupProjection } from './GroupProjection'

export class GroupProjector implements ProjectorInterface<Group, GroupProjection> {
  projectSimple(_userKey: Group): GroupProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, userKey: Group): GroupProjection {
    const fullProjection = this.projectFull(userKey)

    return {
      ...fullProjection,
      user_uuid: userKey.userUuid,
    }
  }

  projectFull(userKey: Group): GroupProjection {
    return {
      uuid: userKey.uuid,
      user_uuid: userKey.userUuid,
      created_at_timestamp: userKey.createdAtTimestamp,
      updated_at_timestamp: userKey.updatedAtTimestamp,
    }
  }
}
