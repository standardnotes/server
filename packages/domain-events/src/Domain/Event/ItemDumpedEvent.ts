import { DomainEventInterface } from './DomainEventInterface'
import { ItemDumpedEventPayload } from './ItemDumpedEventPayload'

export interface ItemDumpedEvent extends DomainEventInterface {
  type: 'ITEM_DUMPED'
  payload: ItemDumpedEventPayload
}
