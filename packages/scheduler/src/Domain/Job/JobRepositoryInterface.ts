import { Uuid } from '@standardnotes/common'
import { Job } from './Job'

export interface JobRepositoryInterface {
  markJobAsDone(jobUuid: Uuid): Promise<void>
  findOneByUuid(uuid: Uuid): Promise<Job | null>
  findPendingOverdue(timestamp: number): Promise<Job[]>
  save(job: Job): Promise<Job>
}
