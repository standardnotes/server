import { EmailMessageIdentifier } from '@standardnotes/common'
import {
  DomainEventService,
  EmailMessageRequestedEvent,
  PredicateVerificationRequestedEvent,
} from '@standardnotes/domain-events'
import { PredicateAuthority } from '@standardnotes/scheduler'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { Job } from '../Job/Job'
import { Predicate } from '../Predicate/Predicate'
import { DomainEventFactoryInterface } from './DomainEventFactoryInterface'

@injectable()
export class DomainEventFactory implements DomainEventFactoryInterface {
  constructor(@inject(TYPES.Timer) private timer: TimerInterface) {}

  createEmailMessageRequestedEvent(
    userEmail: string,
    messageIdentifier: EmailMessageIdentifier,
  ): EmailMessageRequestedEvent {
    return {
      type: 'EMAIL_MESSAGE_REQUESTED',
      createdAt: this.timer.getUTCDate(),
      meta: {
        correlation: {
          userIdentifier: userEmail,
          userIdentifierType: 'email',
        },
        origin: DomainEventService.Scheduler,
      },
      payload: {
        messageIdentifier,
        userEmail,
      },
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
