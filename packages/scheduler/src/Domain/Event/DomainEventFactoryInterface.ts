import { EmailMessageIdentifier } from '@standardnotes/common'
import { EmailMessageRequestedEvent, PredicateVerificationRequestedEvent } from '@standardnotes/domain-events'

import { Job } from '../Job/Job'
import { Predicate } from '../Predicate/Predicate'

export interface DomainEventFactoryInterface {
  createPredicateVerificationRequestedEvent(job: Job, predicate: Predicate): PredicateVerificationRequestedEvent
  createEmailMessageRequestedEvent(
    userEmail: string,
    messageIdentifier: EmailMessageIdentifier,
  ): EmailMessageRequestedEvent
}
