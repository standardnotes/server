import {
  DiscountApplyRequestedEvent,
  DiscountWithdrawRequestedEvent,
  EmailRequestedEvent,
  ExitDiscountWithdrawRequestedEvent,
  PredicateVerificationRequestedEvent,
} from '@standardnotes/domain-events'

import { Job } from '../Job/Job'
import { Predicate } from '../Predicate/Predicate'

export interface DomainEventFactoryInterface {
  createPredicateVerificationRequestedEvent(job: Job, predicate: Predicate): PredicateVerificationRequestedEvent
  createEmailRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: string
    level: string
    body: string
    subject: string
  }): EmailRequestedEvent
  createDiscountApplyRequestedEvent(dto: { userEmail: string; discountCode: string }): DiscountApplyRequestedEvent
  createDiscountWithdrawRequestedEvent(dto: { userEmail: string; discountCode: string }): DiscountWithdrawRequestedEvent
  createExitDiscountWithdrawRequestedEvent(dto: {
    userEmail: string
    discountCode: string
  }): ExitDiscountWithdrawRequestedEvent
}
