import { DomainEventInterface } from './DomainEventInterface'
import { SharedVaultFileRemovedEventPayload } from './SharedVaultFileRemovedEventPayload'

export interface SharedVaultFileRemovedEvent extends DomainEventInterface {
  type: 'SHARED_VAULT_FILE_REMOVED'
  payload: SharedVaultFileRemovedEventPayload
}
