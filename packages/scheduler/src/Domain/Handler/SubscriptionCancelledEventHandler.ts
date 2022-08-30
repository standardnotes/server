import { DomainEventHandlerInterface, SubscriptionCancelledEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { TimerInterface } from '@standardnotes/time'

import TYPES from '../../Bootstrap/Types'
import { Job } from '../Job/Job'
import { JobName } from '../Job/JobName'
import { JobRepositoryInterface } from '../Job/JobRepositoryInterface'
import { JobStatus } from '../Job/JobStatus'

@injectable()
export class SubscriptionCancelledEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.JobRepository) private jobRepository: JobRepositoryInterface,
  ) {}

  async handle(event: SubscriptionCancelledEvent): Promise<void> {
    if (!event.payload.replaced) {
      await this.scheduleExitInterview(event)
    }
  }

  private async scheduleExitInterview(event: SubscriptionCancelledEvent): Promise<void> {
    const job = new Job()
    job.name = JobName.EXIT_INTERVIEW
    job.scheduledAt = this.timer.convertDateToMicroseconds(this.timer.getUTCDateNHoursAhead(1))
    job.createdAt = this.timer.getTimestampInMicroseconds()
    job.status = JobStatus.Pending
    job.userIdentifier = event.payload.userEmail
    job.userIdentifierType = 'email'

    await this.jobRepository.save(job)
  }
}
