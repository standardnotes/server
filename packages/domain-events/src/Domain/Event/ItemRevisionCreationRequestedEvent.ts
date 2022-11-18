import { DomainEventInterface } from './DomainEventInterface'
import { ItemRevisionCreationRequestedEventPayload } from './ItemRevisionCreationRequestedEventPayload'

export interface ItemRevisionCreationRequestedEvent extends DomainEventInterface {
  type: 'ITEM_REVISION_CREATION_REQUESTED'
  payload: ItemRevisionCreationRequestedEventPayload
}
