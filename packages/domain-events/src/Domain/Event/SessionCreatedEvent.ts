import { DomainEventInterface } from './DomainEventInterface'
import { SessionCreatedEventPayload } from './SessionCreatedEventPayload'

export interface SessionCreatedEvent extends DomainEventInterface {
  type: 'SESSION_CREATED'
  payload: SessionCreatedEventPayload
}
