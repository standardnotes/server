import { DomainEventInterface } from './DomainEventInterface'
import { ExitDiscountWithdrawRequestedEventPayload } from './ExitDiscountWithdrawRequestedEventPayload'

export interface ExitDiscountWithdrawRequestedEvent extends DomainEventInterface {
  type: 'EXIT_DISCOUNT_WITHDRAW_REQUESTED'
  payload: ExitDiscountWithdrawRequestedEventPayload
}
