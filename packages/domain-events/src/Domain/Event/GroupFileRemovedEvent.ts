import { DomainEventInterface } from './DomainEventInterface'
import { GroupFileRemovedEventPayload } from './GroupFileRemovedEventPayload'

export interface GroupFileRemovedEvent extends DomainEventInterface {
  type: 'GROUP_FILE_REMOVED'
  payload: GroupFileRemovedEventPayload
}
