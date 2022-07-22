import { DomainEventHandlerInterface, UserRegisteredEvent } from '@standardnotes/domain-events'
import { PredicateAuthority, PredicateName } from '@standardnotes/predicates'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { Job } from '../Job/Job'
import { JobName } from '../Job/JobName'
import { JobRepositoryInterface } from '../Job/JobRepositoryInterface'
import { JobStatus } from '../Job/JobStatus'
import { Predicate } from '../Predicate/Predicate'
import { PredicateRepositoryInterface } from '../Predicate/PredicateRepositoryInterface'
import { PredicateStatus } from '../Predicate/PredicateStatus'

@injectable()
export class UserRegisteredEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.JobRepository) private jobRepository: JobRepositoryInterface,
    @inject(TYPES.PredicateRepository) private predicateRepository: PredicateRepositoryInterface,
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.scheduleEncourageEmailBackupsJob(event)

    await this.scheduleEncourageSubscriptionPurchasing(event)

    await this.scheduleSubscriptionDiscountApplying(event)

    await this.scheduleSubscriptionDiscountWithdraw(event)
  }

  private async scheduleEncourageEmailBackupsJob(event: UserRegisteredEvent): Promise<void> {
    const job = new Job()
    job.name = JobName.ENCOURAGE_EMAIL_BACKUPS
    job.scheduledAt = this.timer.convertDateToMicroseconds(this.timer.getUTCDateNDaysAhead(7))
    job.createdAt = this.timer.getTimestampInMicroseconds()
    job.status = JobStatus.Pending
    job.userIdentifier = event.payload.email
    job.userIdentifierType = 'email'

    await this.jobRepository.save(job)

    const predicate = new Predicate()
    predicate.name = PredicateName.EmailBackupsEnabled
    predicate.status = PredicateStatus.Pending
    predicate.authority = PredicateAuthority.Auth
    predicate.job = Promise.resolve(job)

    await this.predicateRepository.save(predicate)
  }

  private async scheduleEncourageSubscriptionPurchasing(event: UserRegisteredEvent): Promise<void> {
    const job = new Job()
    job.name = JobName.ENCOURAGE_SUBSCRIPTION_PURCHASING
    job.scheduledAt = this.timer.convertDateToMicroseconds(this.timer.getUTCDateNDaysAhead(30))
    job.createdAt = this.timer.getTimestampInMicroseconds()
    job.status = JobStatus.Pending
    job.userIdentifier = event.payload.email
    job.userIdentifierType = 'email'

    await this.jobRepository.save(job)

    const predicate = new Predicate()
    predicate.name = PredicateName.SubscriptionPurchased
    predicate.status = PredicateStatus.Pending
    predicate.authority = PredicateAuthority.Auth
    predicate.job = Promise.resolve(job)

    await this.predicateRepository.save(predicate)
  }

  private async scheduleSubscriptionDiscountApplying(event: UserRegisteredEvent): Promise<void> {
    const job = new Job()
    job.name = JobName.APPLY_SUBSCRIPTION_DISCOUNT
    job.scheduledAt = this.timer.convertDateToMicroseconds(this.timer.getUTCDateNDaysAhead(7))
    job.createdAt = this.timer.getTimestampInMicroseconds()
    job.status = JobStatus.Pending
    job.userIdentifier = event.payload.email
    job.userIdentifierType = 'email'

    await this.jobRepository.save(job)

    const predicate = new Predicate()
    predicate.name = PredicateName.SubscriptionPurchased
    predicate.status = PredicateStatus.Pending
    predicate.authority = PredicateAuthority.Auth
    predicate.job = Promise.resolve(job)

    await this.predicateRepository.save(predicate)
  }

  private async scheduleSubscriptionDiscountWithdraw(event: UserRegisteredEvent): Promise<void> {
    const job = new Job()
    job.name = JobName.WITHDRAW_SUBSCRIPTION_DISCOUNT
    job.scheduledAt = this.timer.convertDateToMicroseconds(this.timer.getUTCDateNDaysAhead(12))
    job.createdAt = this.timer.getTimestampInMicroseconds()
    job.status = JobStatus.Pending
    job.userIdentifier = event.payload.email
    job.userIdentifierType = 'email'

    await this.jobRepository.save(job)
  }
}
