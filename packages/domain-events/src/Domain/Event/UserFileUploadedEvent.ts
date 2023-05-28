import { DomainEventInterface } from './DomainEventInterface'
import { UserFileUploadedEventPayload } from './UserFileUploadedEventPayload'

export interface UserFileUploadedEvent extends DomainEventInterface {
  type: 'USER_FILE_UPLOADED'
  payload: UserFileUploadedEventPayload
}
