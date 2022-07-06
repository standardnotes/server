import { DomainEventInterface } from './DomainEventInterface'

import { OneDriveBackupFailedEventPayload } from './OneDriveBackupFailedEventPayload'

export interface OneDriveBackupFailedEvent extends DomainEventInterface {
  type: 'ONE_DRIVE_BACKUP_FAILED'
  payload: OneDriveBackupFailedEventPayload
}
