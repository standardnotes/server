import { DomainEventInterface } from './DomainEventInterface'
import { UserCredentialsChangedEventPayload } from './UserCredentialsChangedEventPayload'

export interface UserCredentialsChangedEvent extends DomainEventInterface {
  type: 'USER_CREDENTIALS_CHANGED'
  payload: UserCredentialsChangedEventPayload
}
