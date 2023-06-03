import { TimerInterface } from '@standardnotes/time'
import { UserEventFactoryInterface } from './UserEventFactoryInterface'
import { UserEventHash } from './UserEventHash'
import { UserEvent } from '../Model/UserEvent'

export class UserEventFactory implements UserEventFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: { userUuid: string; userEventHash: UserEventHash }): UserEvent {
    const newUserEvent = new UserEvent()
    newUserEvent.uuid = dto.userEventHash.uuid
    newUserEvent.userUuid = dto.userUuid
    newUserEvent.eventType = dto.userEventHash.event_type
    newUserEvent.eventPayload = dto.userEventHash.event_payload

    const now = this.timer.getTimestampInMicroseconds()
    newUserEvent.updatedAtTimestamp = now
    newUserEvent.createdAtTimestamp = now

    if (dto.userEventHash.created_at_timestamp) {
      newUserEvent.createdAtTimestamp = dto.userEventHash.created_at_timestamp
    }

    return newUserEvent
  }

  createStub(dto: { userUuid: string; userEventHash: UserEventHash }): UserEvent {
    const item = this.create(dto)
    return item
  }
}
