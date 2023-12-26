import { DomainEventInterface } from './DomainEventInterface'
import { ItemDeletedEventPayload } from './ItemDeletedEventPayload'

export interface ItemDeletedEvent extends DomainEventInterface {
  type: 'ITEM_DELETED'
  payload: ItemDeletedEventPayload
}
