import { DomainEventInterface } from './DomainEventInterface'
import { ItemsChangedOnServerEventPayload } from './ItemsChangedOnServerEventPayload'

export interface ItemsChangedOnServerEvent extends DomainEventInterface {
  type: 'ITEMS_CHANGED_ON_SERVER'
  payload: ItemsChangedOnServerEventPayload
}
