import { DomainEventInterface } from './DomainEventInterface'

import { MailBackupAttachmentTooBigEventPayload } from './MailBackupAttachmentTooBigEventPayload'

export interface MailBackupAttachmentTooBigEvent extends DomainEventInterface {
  type: 'MAIL_BACKUP_ATTACHMENT_TOO_BIG'
  payload: MailBackupAttachmentTooBigEventPayload
}
