import { DomainEventInterface } from './DomainEventInterface'
import { EmailBouncedEventPayload } from './EmailBouncedEventPayload'

export interface EmailBouncedEvent extends DomainEventInterface {
  type: 'EMAIL_BOUNCED'
  payload: EmailBouncedEventPayload
}
