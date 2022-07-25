import { EmailMessageIdentifier } from '@standardnotes/common'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { PredicateName } from '@standardnotes/predicates'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

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
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async interpret(jobUuid: string): Promise<void> {
    const job = await this.jobRepository.findOneByUuid(jobUuid)

    if (job === null) {
      return
    }

    this.logger.info(`[${jobUuid}]${job.name}: Interpreting job as done.`)

    if (!(await this.predicatesAreFulfilled(job))) {
      this.logger.info(`[${jobUuid}]${job.name}: predicates are not fulfilled.`)

      return
    }

    switch (job.name) {
      case JobName.ENCOURAGE_EMAIL_BACKUPS:
        if (job.userIdentifierType === 'email') {
          await this.requestEmailBackupEncouragementEmail(job)
        }
        return
      case JobName.ENCOURAGE_SUBSCRIPTION_PURCHASING:
        if (job.userIdentifierType === 'email') {
          await this.requestSubscriptionPurchaseEncouragementEmail(job)
        }
        return
      case JobName.EXIT_INTERVIEW:
        if (job.userIdentifierType === 'email') {
          await this.requestExitInterviewEmail(job)
        }
        return
      case JobName.APPLY_SUBSCRIPTION_DISCOUNT:
        if (job.userIdentifierType === 'email' && job.userIdentifier.includes('@standardnotes.com')) {
          await this.requestDiscountApply(job)
        }
        return
      case JobName.WITHDRAW_SUBSCRIPTION_DISCOUNT:
        if (job.userIdentifierType === 'email' && job.userIdentifier.includes('@standardnotes.com')) {
          await this.requestDiscountWithdraw(job)
        }
        return
      default:
        this.logger.warn(`[${jobUuid}]${job.name}: job is not interpretable.`)

        return
    }
  }

  private async requestEmailBackupEncouragementEmail(job: Job): Promise<void> {
    this.logger.info(`[${job.uuid}]${job.name}: requesting email backup encouragement email.`)

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createEmailMessageRequestedEvent({
        userEmail: job.userIdentifier,
        messageIdentifier: EmailMessageIdentifier.ENCOURAGE_EMAIL_BACKUPS,
        context: {},
      }),
    )
  }

  private async requestSubscriptionPurchaseEncouragementEmail(job: Job): Promise<void> {
    this.logger.info(`[${job.uuid}]${job.name}: requesting subscription purchase encouragement email.`)

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

  private async requestExitInterviewEmail(job: Job): Promise<void> {
    this.logger.info(`[${job.uuid}]${job.name}: requesting exit interview email.`)

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createEmailMessageRequestedEvent({
        userEmail: job.userIdentifier,
        messageIdentifier: EmailMessageIdentifier.EXIT_INTERVIEW,
        context: {},
      }),
    )
  }

  private async requestDiscountApply(job: Job): Promise<void> {
    this.logger.info(`[${job.uuid}]${job.name}: requesting discount applying.`)

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createDiscountApplyRequestedEvent({
        userEmail: job.userIdentifier,
        discountCode: 'econ-10',
      }),
    )
  }

  private async requestDiscountWithdraw(job: Job): Promise<void> {
    this.logger.info(`[${job.uuid}]${job.name}: requesting discount withdraw.`)

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createDiscountWithdrawRequestedEvent({
        userEmail: job.userIdentifier,
        discountCode: 'econ-10',
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
      case JobName.APPLY_SUBSCRIPTION_DISCOUNT:
        return (
          predicates.find((predicate) => predicate.name === PredicateName.SubscriptionPurchased)?.status ===
          PredicateStatus.Denied
        )
      default:
        return true
    }
  }
}
