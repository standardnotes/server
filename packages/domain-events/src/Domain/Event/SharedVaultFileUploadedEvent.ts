import { DomainEventInterface } from './DomainEventInterface'
import { SharedVaultFileUploadedEventPayload } from './SharedVaultFileUploadedEventPayload'

export interface SharedVaultFileUploadedEvent extends DomainEventInterface {
  type: 'SHARED_VAULT_FILE_UPLOADED'
  payload: SharedVaultFileUploadedEventPayload
}
