import { UserEvent } from '../Domain/UserEvent/Model/UserEvent'
import { ProjectorInterface } from './ProjectorInterface'
import { UserEventProjection } from './UserEventProjection'

export class UserEventProjector implements ProjectorInterface<UserEvent, UserEventProjection> {
  projectSimple(_userEvent: UserEvent): UserEventProjection {
    throw Error('not implemented')
  }

  projectCustom(_projectionType: string, userEvent: UserEvent): UserEventProjection {
    const fullProjection = this.projectFull(userEvent)

    return {
      ...fullProjection,
      user_uuid: userEvent.userUuid,
    }
  }

  projectFull(userEvent: UserEvent): UserEventProjection {
    return {
      uuid: userEvent.uuid,
      user_uuid: userEvent.userUuid,
      event_type: userEvent.eventType,
      event_payload: userEvent.eventPayload,
      created_at_timestamp: userEvent.createdAtTimestamp,
      updated_at_timestamp: userEvent.updatedAtTimestamp,
    }
  }
}
