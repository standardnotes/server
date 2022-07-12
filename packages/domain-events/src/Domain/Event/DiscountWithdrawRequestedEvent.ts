import { DomainEventInterface } from './DomainEventInterface'
import { DiscountWithdrawRequestedEventPayload } from './DiscountWithdrawRequestedEventPayload'

export interface DiscountWithdrawRequestedEvent extends DomainEventInterface {
  type: 'DISCOUNT_WITHDRAW_REQUESTED'
  payload: DiscountWithdrawRequestedEventPayload
}
