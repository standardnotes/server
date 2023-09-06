import { DomainEventInterface } from './DomainEventInterface'
import { UserAddedToSharedVaultEventPayload } from './UserAddedToSharedVaultEventPayload'

export interface UserAddedToSharedVaultEvent extends DomainEventInterface {
  type: 'USER_ADDED_TO_SHARED_VAULT'
  payload: UserAddedToSharedVaultEventPayload
}
