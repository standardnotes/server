import { DomainEventInterface } from './DomainEventInterface'
import { UserFileRemovedEventPayload } from './UserFileRemovedEventPayload'

export interface UserFileRemovedEvent extends DomainEventInterface {
  type: 'USER_FILE_REMOVED'
  payload: UserFileRemovedEventPayload
}
