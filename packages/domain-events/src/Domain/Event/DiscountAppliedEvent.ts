import { DomainEventInterface } from './DomainEventInterface'

import { DiscountAppliedEventPayload } from './DiscountAppliedEventPayload'

export interface DiscountAppliedEvent extends DomainEventInterface {
  type: 'DISCOUNT_APPLIED'
  payload: DiscountAppliedEventPayload
}
