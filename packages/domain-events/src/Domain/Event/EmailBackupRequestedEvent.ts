import { DomainEventInterface } from './DomainEventInterface'
import { EmailBackupRequestedEventPayload } from './EmailBackupRequestedEventPayload'

export interface EmailBackupRequestedEvent extends DomainEventInterface {
  type: 'EMAIL_BACKUP_REQUESTED'
  payload: EmailBackupRequestedEventPayload
}
