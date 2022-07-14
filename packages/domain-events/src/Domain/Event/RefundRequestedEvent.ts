import { DomainEventInterface } from './DomainEventInterface'

import { RefundRequestedEventPayload } from './RefundRequestedEventPayload'

export interface RefundRequestedEvent extends DomainEventInterface {
  type: 'REFUND_REQUESTED'
  payload: RefundRequestedEventPayload
}
