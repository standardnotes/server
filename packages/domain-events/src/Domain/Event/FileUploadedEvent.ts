import { DomainEventInterface } from './DomainEventInterface'
import { FileUploadedEventPayload } from './FileUploadedEventPayload'

export interface FileUploadedEvent extends DomainEventInterface {
  type: 'FILE_UPLOADED'
  payload: FileUploadedEventPayload
}
