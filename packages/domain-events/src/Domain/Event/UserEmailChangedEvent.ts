import { DomainEventInterface } from './DomainEventInterface'
import { UserEmailChangedEventPayload } from './UserEmailChangedEventPayload'

export interface UserEmailChangedEvent extends DomainEventInterface {
  type: 'USER_EMAIL_CHANGED'
  payload: UserEmailChangedEventPayload
}
