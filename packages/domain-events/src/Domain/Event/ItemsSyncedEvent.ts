import { DomainEventInterface } from './DomainEventInterface'
import { ItemsSyncedEventPayload } from './ItemsSyncedEventPayload'

export interface ItemsSyncedEvent extends DomainEventInterface {
  type: 'ITEMS_SYNCED'
  payload: ItemsSyncedEventPayload
}
