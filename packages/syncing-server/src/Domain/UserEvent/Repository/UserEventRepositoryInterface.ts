import { UserEvent } from '../Model/UserEvent'
import { UserEventType } from '../Model/UserEventType'

export type UserEventQuery = {
  userUuid: string
  eventType?: UserEventType
  lastSyncTime?: number
}

export interface UserEventsRepositoryInterface {
  findByUuid(uuid: string): Promise<UserEvent | null>
  create(userEvent: UserEvent): Promise<UserEvent>
  save(userEvent: UserEvent): Promise<UserEvent>
  remove(userEvent: UserEvent): Promise<UserEvent>
  findAll(query: UserEventQuery): Promise<UserEvent[]>
}
