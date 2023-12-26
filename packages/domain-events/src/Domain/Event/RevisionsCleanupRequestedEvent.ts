import { DomainEventInterface } from './DomainEventInterface'
import { RevisionsCleanupRequestedEventPayload } from './RevisionsCleanupRequestedEventPayload'

export interface RevisionsCleanupRequestedEvent extends DomainEventInterface {
  type: 'REVISIONS_CLEANUP_REQUESTED'
  payload: RevisionsCleanupRequestedEventPayload
}
