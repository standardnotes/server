import { DomainEventInterface } from './DomainEventInterface'
import { FileQuotaRecalculatedEventPayload } from './FileQuotaRecalculatedEventPayload'

export interface FileQuotaRecalculatedEvent extends DomainEventInterface {
  type: 'FILE_QUOTA_RECALCULATED'
  payload: FileQuotaRecalculatedEventPayload
}
