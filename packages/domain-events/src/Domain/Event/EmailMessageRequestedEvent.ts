import { DomainEventInterface } from './DomainEventInterface'
import { EmailMessageRequestedEventPayload } from './EmailMessageRequestedEventPayload'

export interface EmailMessageRequestedEvent extends DomainEventInterface {
  type: 'EMAIL_MESSAGE_REQUESTED'
  payload: EmailMessageRequestedEventPayload
}
