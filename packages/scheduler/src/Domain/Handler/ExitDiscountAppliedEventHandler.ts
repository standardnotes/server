import { DomainEventHandlerInterface, ExitDiscountAppliedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { TimerInterface } from '@standardnotes/time'

import TYPES from '../../Bootstrap/Types'
import { Job } from '../Job/Job'
import { JobName } from '../Job/JobName'
import { JobRepositoryInterface } from '../Job/JobRepositoryInterface'
import { JobStatus } from '../Job/JobStatus'

@injectable()
export class ExitDiscountAppliedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.JobRepository) private jobRepository: JobRepositoryInterface,
  ) {}

  async handle(event: ExitDiscountAppliedEvent): Promise<void> {
    await this.scheduleExitDiscountWithdraw(event)
  }

  private async scheduleExitDiscountWithdraw(event: ExitDiscountAppliedEvent): Promise<void> {
    const job = new Job()
    job.name = JobName.WITHDRAW_SUBSCRIPTION_EXIT_DISCOUNT
    job.scheduledAt = this.timer.convertDateToMicroseconds(this.timer.getUTCDateNHoursAhead(24))
    job.createdAt = this.timer.getTimestampInMicroseconds()
    job.status = JobStatus.Pending
    job.userIdentifier = event.payload.userEmail
    job.userIdentifierType = 'email'

    await this.jobRepository.save(job)
  }
}
