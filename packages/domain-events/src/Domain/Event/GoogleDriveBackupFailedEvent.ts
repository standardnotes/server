import { DomainEventInterface } from './DomainEventInterface'

import { GoogleDriveBackupFailedEventPayload } from './GoogleDriveBackupFailedEventPayload'

export interface GoogleDriveBackupFailedEvent extends DomainEventInterface {
  type: 'GOOGLE_DRIVE_BACKUP_FAILED'
  payload: GoogleDriveBackupFailedEventPayload
}
