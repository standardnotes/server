import { DomainEventInterface } from './DomainEventInterface'

import { PaymentsAccountDeletedEventPayload } from './PaymentsAccountDeletedEventPayload'

export interface PaymentsAccountDeletedEvent extends DomainEventInterface {
  type: 'PAYMENTS_ACCOUNT_DELETED'
  payload: PaymentsAccountDeletedEventPayload
}
