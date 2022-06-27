import { EmailMessageIdentifier } from '@standardnotes/common'
import { EmailMessageRequestedEvent, PredicateVerificationRequestedEvent } from '@standardnotes/domain-events'

import { Job } from '../Job/Job'
import { Predicate } from '../Predicate/Predicate'

export interface DomainEventFactoryInterface {
  createPredicateVerificationRequestedEvent(job: Job, predicate: Predicate): PredicateVerificationRequestedEvent
  createEmailMessageRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: EmailMessageIdentifier
    context: Record<string, unknown>
  }): EmailMessageRequestedEvent
}
