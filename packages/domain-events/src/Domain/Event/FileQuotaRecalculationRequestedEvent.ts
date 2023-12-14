import { DomainEventInterface } from './DomainEventInterface'
import { FileQuotaRecalculationRequestedEventPayload } from './FileQuotaRecalculationRequestedEventPayload'

export interface FileQuotaRecalculationRequestedEvent extends DomainEventInterface {
  type: 'FILE_QUOTA_RECALCULATION_REQUESTED'
  payload: FileQuotaRecalculationRequestedEventPayload
}
