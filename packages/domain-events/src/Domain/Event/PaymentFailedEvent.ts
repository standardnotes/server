import { DomainEventInterface } from './DomainEventInterface'

import { PaymentFailedEventPayload } from './PaymentFailedEventPayload'

export interface PaymentFailedEvent extends DomainEventInterface {
  type: 'PAYMENT_FAILED'
  payload: PaymentFailedEventPayload
}
