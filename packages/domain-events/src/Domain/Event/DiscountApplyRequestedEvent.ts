import { DomainEventInterface } from './DomainEventInterface'
import { DiscountApplyRequestedEventPayload } from './DiscountApplyRequestedEventPayload'

export interface DiscountApplyRequestedEvent extends DomainEventInterface {
  type: 'DISCOUNT_APPLY_REQUESTED'
  payload: DiscountApplyRequestedEventPayload
}
