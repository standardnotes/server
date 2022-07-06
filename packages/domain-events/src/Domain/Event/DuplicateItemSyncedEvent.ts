import { DomainEventInterface } from './DomainEventInterface'
import { DuplicateItemSyncedEventPayload } from './DuplicateItemSyncedEventPayload'

export interface DuplicateItemSyncedEvent extends DomainEventInterface {
  type: 'DUPLICATE_ITEM_SYNCED'
  payload: DuplicateItemSyncedEventPayload
}
