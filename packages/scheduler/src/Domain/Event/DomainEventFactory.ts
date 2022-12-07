import {
  DiscountApplyRequestedEvent,
  DiscountWithdrawRequestedEvent,
  DomainEventService,
  EmailRequestedEvent,
  ExitDiscountWithdrawRequestedEvent,
  PredicateVerificationRequestedEvent,
} from '@standardnotes/domain-events'
import { PredicateAuthority } from '@standardnotes/predicates'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { Job } from '../Job/Job'
import { Predicate } from '../Predicate/Predicate'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(@inject(TYPES.Timer) private timer: TimerInterface) {}

  createDiscountApplyRequestedEvent(dto: { userEmail: string; discountCode: string }): DiscountApplyRequestedEvent {
    return {
      type: 'DISCOUNT_APPLY_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userEmail,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Scheduler,
      },
      payload: dto,
    }
  }

  createDiscountWithdrawRequestedEvent(dto: {
    userEmail: string
    discountCode: string
  }): DiscountWithdrawRequestedEvent {
    return {
      type: 'DISCOUNT_WITHDRAW_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userEmail,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Scheduler,
      },
      payload: dto,
    }
  }

  createExitDiscountWithdrawRequestedEvent(dto: {
    userEmail: string
    discountCode: string
  }): ExitDiscountWithdrawRequestedEvent {
    return {
      type: 'EXIT_DISCOUNT_WITHDRAW_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userEmail,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Scheduler,
      },
      payload: dto,
    }
  }

  createEmailRequestedEvent(dto: {
    userEmail: string
    messageIdentifier: string
    level: string
    body: string
    subject: string
  }): EmailRequestedEvent {
    return {
      type: 'EMAIL_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: dto.userEmail,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Scheduler,
      },
      payload: dto,
    }
  }

  createPredicateVerificationRequestedEvent(job: Job, predicate: Predicate): PredicateVerificationRequestedEvent {
    return {
      type: 'PREDICATE_VERIFICATION_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: job.userIdentifier,
          userIdentifierType: job.userIdentifierType,
        },
        origin: DomainEventService.Scheduler,
        target: this.translatePredicateAuthorityToDomainEventService(predicate.authority),
      },
      payload: {
        predicate: {
          authority: predicate.authority,
          name: predicate.name,
          jobUuid: job.uuid,
        },
      },
    }
  }

  private translatePredicateAuthorityToDomainEventService(
    predicateAuthority: PredicateAuthority,
  ): DomainEventService | undefined {
    switch (predicateAuthority) {
      case PredicateAuthority.Auth:
        return DomainEventService.Auth
      case PredicateAuthority.SyncingServer:
        return DomainEventService.SyncingServer
      default:
        return undefined
    }
  }
}
