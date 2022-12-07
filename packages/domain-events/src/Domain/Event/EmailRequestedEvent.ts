import { DomainEventInterface } from './DomainEventInterface'
import { EmailRequestedEventPayload } from './EmailRequestedEventPayload'

export interface EmailRequestedEvent extends DomainEventInterface {
  type: 'EMAIL_REQUESTED'
  payload: EmailRequestedEventPayload
}
