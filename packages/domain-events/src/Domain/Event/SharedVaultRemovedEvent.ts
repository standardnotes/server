import { DomainEventInterface } from './DomainEventInterface'
import { SharedVaultRemovedEventPayload } from './SharedVaultRemovedEventPayload'

export interface SharedVaultRemovedEvent extends DomainEventInterface {
  type: 'SHARED_VAULT_REMOVED'
  payload: SharedVaultRemovedEventPayload
}
