import { DomainEventInterface } from './DomainEventInterface'
import { VaultFileRemovedEventPayload } from './VaultFileRemovedEventPayload'

export interface VaultFileRemovedEvent extends DomainEventInterface {
  type: 'VAULT_FILE_REMOVED'
  payload: VaultFileRemovedEventPayload
}
