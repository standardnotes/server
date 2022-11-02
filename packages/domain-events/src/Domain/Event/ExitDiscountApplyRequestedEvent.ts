import { DomainEventInterface } from './DomainEventInterface'
import { ExitDiscountApplyRequestedEventPayload } from './ExitDiscountApplyRequestedEventPayload'

export interface ExitDiscountApplyRequestedEvent extends DomainEventInterface {
  type: 'EXIT_DISCOUNT_APPLY_REQUESTED'
  payload: ExitDiscountApplyRequestedEventPayload
}
