import { DomainEventInterface } from './DomainEventInterface'
import { ItemRemovedFromSharedVaultEventPayload } from './ItemRemovedFromSharedVaultEventPayload'

export interface ItemRemovedFromSharedVaultEvent extends DomainEventInterface {
  type: 'ITEM_REMOVED_FROM_SHARED_VAULT'
  payload: ItemRemovedFromSharedVaultEventPayload
}
