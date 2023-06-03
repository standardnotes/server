import { UserEvent } from '../Model/UserEvent'
import { UserEventHash } from './UserEventHash'

export interface UserEventFactoryInterface {
  create(dto: { userUuid: string; userEventHash: UserEventHash }): UserEvent
  createStub(dto: { userUuid: string; userEventHash: UserEventHash }): UserEvent
}
