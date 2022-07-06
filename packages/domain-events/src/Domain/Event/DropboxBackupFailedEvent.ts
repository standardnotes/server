import { DomainEventInterface } from './DomainEventInterface'

import { DropboxBackupFailedEventPayload } from './DropboxBackupFailedEventPayload'

export interface DropboxBackupFailedEvent extends DomainEventInterface {
  type: 'DROPBOX_BACKUP_FAILED'
  payload: DropboxBackupFailedEventPayload
}
