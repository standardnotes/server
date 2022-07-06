import { EmailMessageIdentifier } from '@standardnotes/common'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { PredicateName } from '@standardnotes/predicates'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { PredicateRepositoryInterface } from '../Predicate/PredicateRepositoryInterface'
import { PredicateStatus } from '../Predicate/PredicateStatus'
import { Job } from './Job'

import { JobDoneInterpreterInterface } from './JobDoneInterpreterInterface'
import { JobName } from './JobName'
import { JobRepositoryInterface } from './JobRepositoryInterface'

@injectable()
export class JobDoneInterpreter implements JobDoneInterpreterInterface {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: JobRepositoryInterface,
    @inject(TYPES.PredicateRepository) private predicateRepository: PredicateRepositoryInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async interpret(jobUuid: string): Promise<void> {
    const job = await this.jobRepository.findOneByUuid(jobUuid)

    if (job === null) {
      return
    }

    if (!(await this.predicatesAreFulfilled(job))) {
      return
    }

    switch (job.name) {
      case JobName.ENCOURAGE_EMAIL_BACKUPS:
        if (job.userIdentifierType === 'email') {
          await this.requestEmailBackupEncouragementEmail(job.userIdentifier)
        }
        return
      case JobName.ENCOURAGE_SUBSCRIPTION_PURCHASING:
        if (job.userIdentifierType === 'email') {
          await this.requestSubscriptionPurchaseEncouragementEmail(job)
        }
        return
      case JobName.EXIT_INTERVIEW:
        if (job.userIdentifierType === 'email') {
          await this.requestExitInterviewEmail(job.userIdentifier)
        }
        return
      default:
        return
    }
  }

  private async requestEmailBackupEncouragementEmail(userEmail: string): Promise<void> {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createEmailMessageRequestedEvent({
        userEmail,
        messageIdentifier: EmailMessageIdentifier.ENCOURAGE_EMAIL_BACKUPS,
        context: {},
      }),
    )
  }

  private async requestSubscriptionPurchaseEncouragementEmail(job: Job): Promise<void> {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createEmailMessageRequestedEvent({
        userEmail: job.userIdentifier,
        messageIdentifier: EmailMessageIdentifier.ENCOURAGE_SUBSCRIPTION_PURCHASING,
        context: {
          userRegisteredAt: job.createdAt,
        },
      }),
    )
  }

  private async requestExitInterviewEmail(userEmail: string): Promise<void> {
    await this.domainEventPublisher.publish(
      this.domainEventFactory.createEmailMessageRequestedEvent({
        userEmail,
        messageIdentifier: EmailMessageIdentifier.EXIT_INTERVIEW,
        context: {},
      }),
    )
  }

  private async predicatesAreFulfilled(job: Job): Promise<boolean> {
    const predicates = await this.predicateRepository.findByJobUuid(job.uuid)

    switch (job.name) {
      case JobName.ENCOURAGE_EMAIL_BACKUPS:
        return (
          predicates.find((predicate) => predicate.name === PredicateName.EmailBackupsEnabled)?.status ===
          PredicateStatus.Denied
        )
      case JobName.ENCOURAGE_SUBSCRIPTION_PURCHASING:
        return (
          predicates.find((predicate) => predicate.name === PredicateName.SubscriptionPurchased)?.status ===
          PredicateStatus.Denied
        )
      default:
        return true
    }
  }
}
