import { DomainEventInterface } from './DomainEventInterface'
import { UserSignedInEventPayload } from './UserSignedInEventPayload'

export interface UserSignedInEvent extends DomainEventInterface {
  type: 'USER_SIGNED_IN'
  payload: UserSignedInEventPayload
}
