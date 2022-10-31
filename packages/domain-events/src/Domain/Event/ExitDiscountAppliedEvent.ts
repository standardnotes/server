import { DomainEventInterface } from './DomainEventInterface'

import { ExitDiscountAppliedEventPayload } from './ExitDiscountAppliedEventPayload'

export interface ExitDiscountAppliedEvent extends DomainEventInterface {
  type: 'EXIT_DISCOUNT_APPLIED'
  payload: ExitDiscountAppliedEventPayload
}
