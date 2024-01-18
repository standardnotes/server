import { DomainEventInterface } from './DomainEventInterface'
import { ContentSizesFixRequestedEventPayload } from './ContentSizesFixRequestedEventPayload'

export interface ContentSizesFixRequestedEvent extends DomainEventInterface {
  type: 'CONTENT_SIZES_FIX_REQUESTED'
  payload: ContentSizesFixRequestedEventPayload
}
