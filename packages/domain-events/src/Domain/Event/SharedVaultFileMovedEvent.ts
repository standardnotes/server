import { DomainEventInterface } from './DomainEventInterface'
import { SharedVaultFileMovedEventPayload } from './SharedVaultFileMovedEventPayload'

export interface SharedVaultFileMovedEvent extends DomainEventInterface {
  type: 'SHARED_VAULT_FILE_MOVED'
  payload: SharedVaultFileMovedEventPayload
}
