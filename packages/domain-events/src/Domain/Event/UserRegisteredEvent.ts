import { DomainEventInterface } from './DomainEventInterface'
import { UserRegisteredEventPayload } from './UserRegisteredEventPayload'

export interface UserRegisteredEvent extends DomainEventInterface {
  type: 'USER_REGISTERED'
  payload: UserRegisteredEventPayload
}
