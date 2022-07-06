import { DomainEventInterface } from './DomainEventInterface'
import { EmailBackupAttachmentCreatedEventPayload } from './EmailBackupAttachmentCreatedEventPayload'

export interface EmailBackupAttachmentCreatedEvent extends DomainEventInterface {
  type: 'EMAIL_BACKUP_ATTACHMENT_CREATED'
  payload: EmailBackupAttachmentCreatedEventPayload
}
