import { EmailRequestedEvent } from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createEmailRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: string
    level: string
    body: string
    subject: string
  }): EmailRequestedEvent
}
