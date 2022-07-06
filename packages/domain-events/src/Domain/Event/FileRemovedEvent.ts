import { DomainEventInterface } from './DomainEventInterface'
import { FileRemovedEventPayload } from './FileRemovedEventPayload'

export interface FileRemovedEvent extends DomainEventInterface {
  type: 'FILE_REMOVED'
  payload: FileRemovedEventPayload
}
