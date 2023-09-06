import { DomainEventInterface } from './DomainEventInterface'
import { UserRemovedFromSharedVaultEventPayload } from './UserRemovedFromSharedVaultEventPayload'

export interface UserRemovedFromSharedVaultEvent extends DomainEventInterface {
  type: 'USER_REMOVED_FROM_SHARED_VAULT'
  payload: UserRemovedFromSharedVaultEventPayload
}
