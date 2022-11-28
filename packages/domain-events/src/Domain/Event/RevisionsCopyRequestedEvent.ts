import { DomainEventInterface } from './DomainEventInterface'
import { RevisionsCopyRequestedEventPayload } from './RevisionsCopyRequestedEventPayload'

export interface RevisionsCopyRequestedEvent extends DomainEventInterface {
  type: 'REVISIONS_COPY_REQUESTED'
  payload: RevisionsCopyRequestedEventPayload
}
