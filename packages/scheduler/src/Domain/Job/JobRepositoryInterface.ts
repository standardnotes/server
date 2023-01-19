import { Job } from './Job'

export interface JobRepositoryInterface {
  markJobAsDone(jobUuid: string): Promise<void>
  findOneByUuid(uuid: string): Promise<Job | null>
  findPendingOverdue(timestamp: number): Promise<Job[]>
  save(job: Job): Promise<Job>
}
