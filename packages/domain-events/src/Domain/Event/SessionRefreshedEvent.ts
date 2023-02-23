import { DomainEventInterface } from './DomainEventInterface'
import { SessionRefreshedEventPayload } from './SessionRefreshedEventPayload'

export interface SessionRefreshedEvent extends DomainEventInterface {
  type: 'SESSION_REFRESHED'
  payload: SessionRefreshedEventPayload
}
