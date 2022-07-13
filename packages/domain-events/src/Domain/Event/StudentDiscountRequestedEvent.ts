import { DomainEventInterface } from './DomainEventInterface'

import { StudentDiscountRequestedEventPayload } from './StudentDiscountRequestedEventPayload'

export interface StudentDiscountRequestedEvent extends DomainEventInterface {
  type: 'STUDENT_DISCOUNT_REQUESTED'
  payload: StudentDiscountRequestedEventPayload
}
