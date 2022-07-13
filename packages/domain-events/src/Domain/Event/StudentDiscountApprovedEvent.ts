import { DomainEventInterface } from './DomainEventInterface'

import { StudentDiscountApprovedEventPayload } from './StudentDiscountApprovedEventPayload'

export interface StudentDiscountApprovedEvent extends DomainEventInterface {
  type: 'STUDENT_DISCOUNT_APPROVED'
  payload: StudentDiscountApprovedEventPayload
}
