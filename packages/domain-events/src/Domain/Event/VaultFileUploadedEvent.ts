import { DomainEventInterface } from './DomainEventInterface'
import { VaultFileUploadedEventPayload } from './VaultFileUploadedEventPayload'

export interface VaultFileUploadedEvent extends DomainEventInterface {
  type: 'VAULT_FILE_UPLOADED'
  payload: VaultFileUploadedEventPayload
}
