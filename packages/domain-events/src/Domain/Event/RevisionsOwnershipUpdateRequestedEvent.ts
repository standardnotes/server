import { DomainEventInterface } from './DomainEventInterface'
import { RevisionsOwnershipUpdateRequestedEventPayload } from './RevisionsOwnershipUpdateRequestedEventPayload'

export interface RevisionsOwnershipUpdateRequestedEvent extends DomainEventInterface {
  type: 'REVISIONS_OWNERSHIP_UPDATE_REQUESTED'
  payload: RevisionsOwnershipUpdateRequestedEventPayload
}
