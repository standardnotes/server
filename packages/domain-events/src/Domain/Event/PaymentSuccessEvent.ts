import { DomainEventInterface } from './DomainEventInterface'

import { PaymentSuccessEventPayload } from './PaymentSuccessEventPayload'

export interface PaymentSuccessEvent extends DomainEventInterface {
  type: 'PAYMENT_SUCCESS'
  payload: PaymentSuccessEventPayload
}
