import { EmailMessageIdentifier } from '@standardnotes/common'
import {
  DiscountApplyRequestedEvent,
  DiscountWithdrawRequestedEvent,
  EmailMessageRequestedEvent,
  ExitDiscountWithdrawRequestedEvent,
  PredicateVerificationRequestedEvent,
} from '@standardnotes/domain-events'

import { Job } from '../Job/Job'
import { Predicate } from '../Predicate/Predicate'

export interface DomainEventFactoryInterface {
  createPredicateVerificationRequestedEvent(job: Job, predicate: Predicate): PredicateVerificationRequestedEvent
  createEmailMessageRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: EmailMessageIdentifier
    context: Record<string, unknown>
  }): EmailMessageRequestedEvent
  createDiscountApplyRequestedEvent(dto: { userEmail: string; discountCode: string }): DiscountApplyRequestedEvent
  createDiscountWithdrawRequestedEvent(dto: { userEmail: string; discountCode: string }): DiscountWithdrawRequestedEvent
  createExitDiscountWithdrawRequestedEvent(dto: {
    userEmail: string
    discountCode: string
  }): ExitDiscountWithdrawRequestedEvent
}
