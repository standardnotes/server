import { DomainEventInterface } from './DomainEventInterface'
import { EmailSentEventPayload } from './EmailSentEventPayload'

export interface EmailSentEvent extends DomainEventInterface {
  type: 'EMAIL_SENT'
  payload: EmailSentEventPayload
}
