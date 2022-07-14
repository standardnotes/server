import { DomainEventInterface } from './DomainEventInterface'

import { RefundProcessedEventPayload } from './RefundProcessedEventPayload'

export interface RefundProcessedEvent extends DomainEventInterface {
  type: 'REFUND_PROCESSED'
  payload: RefundProcessedEventPayload
}
