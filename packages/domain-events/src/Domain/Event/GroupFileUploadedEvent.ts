import { DomainEventInterface } from './DomainEventInterface'
import { GroupFileUploadedEventPayload } from './GroupFileUploadedEventPayload'

export interface GroupFileUploadedEvent extends DomainEventInterface {
  type: 'GROUP_FILE_UPLOADED'
  payload: GroupFileUploadedEventPayload
}
