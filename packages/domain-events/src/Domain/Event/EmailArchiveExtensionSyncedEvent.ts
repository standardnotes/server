import { DomainEventInterface } from './DomainEventInterface'
import { EmailArchiveExtensionSyncedEventPayload } from './EmailArchiveExtensionSyncedEventPayload'

export interface EmailArchiveExtensionSyncedEvent extends DomainEventInterface {
  type: 'EMAIL_ARCHIVE_EXTENSION_SYNCED'
  payload: EmailArchiveExtensionSyncedEventPayload
}
