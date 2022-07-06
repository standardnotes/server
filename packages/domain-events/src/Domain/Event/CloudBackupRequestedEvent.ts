import { DomainEventInterface } from './DomainEventInterface'
import { CloudBackupRequestedEventPayload } from './CloudBackupRequestedEventPayload'

export interface CloudBackupRequestedEvent extends DomainEventInterface {
  type: 'CLOUD_BACKUP_REQUESTED'
  payload: CloudBackupRequestedEventPayload
}
