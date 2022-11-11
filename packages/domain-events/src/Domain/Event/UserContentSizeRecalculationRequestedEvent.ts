import { DomainEventInterface } from './DomainEventInterface'
import { UserContentSizeRecalculationRequestedEventPayload } from './UserContentSizeRecalculationRequestedEventPayload'

export interface UserContentSizeRecalculationRequestedEvent extends DomainEventInterface {
  type: 'USER_CONTENT_SIZE_RECALCULATION_REQUESTED'
  payload: UserContentSizeRecalculationRequestedEventPayload
}
