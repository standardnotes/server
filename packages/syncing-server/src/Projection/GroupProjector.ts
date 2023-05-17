import { Group } from './../Domain/Group/Model/Group'
import { ProjectorInterface } from './ProjectorInterface'
import { GroupProjection } from './GroupProjection'

export class GroupProjector implements ProjectorInterface<Group, GroupProjection> {
  async projectSimple(_userKey: Group): Promise<GroupProjection> {
    throw Error('not implemented')
  }

  async projectCustom(_projectionType: string, userKey: Group): Promise<GroupProjection> {
    const fullProjection = await this.projectFull(userKey)

    return {
      ...fullProjection,
      user_uuid: userKey.userUuid,
    }
  }

  async projectFull(userKey: Group): Promise<GroupProjection> {
    return {
      uuid: userKey.uuid,
      user_uuid: userKey.userUuid,
      created_at_timestamp: userKey.createdAtTimestamp,
      updated_at_timestamp: userKey.updatedAtTimestamp,
    }
  }
}
