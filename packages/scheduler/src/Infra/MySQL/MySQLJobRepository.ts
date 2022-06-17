import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'

import TYPES from '../../Bootstrap/Types'
import { Job } from '../../Domain/Job/Job'
import { JobRepositoryInterface } from '../../Domain/Job/JobRepositoryInterface'
import { JobStatus } from '../../Domain/Job/JobStatus'

@injectable()
export class MySQLJobRepository implements JobRepositoryInterface {
  constructor(
    @inject(TYPES.ORMJobRepository)
    private ormRepository: Repository<Job>,
  ) {}

  async save(job: Job): Promise<Job> {
    return this.ormRepository.save(job)
  }

  async findPendingOverdue(timestamp: number): Promise<Job[]> {
    return this.ormRepository
      .createQueryBuilder('job')
      .where('job.status = :status AND job.scheduled_at <= :timestamp', {
        status: JobStatus.Pending,
        timestamp,
      })
      .getMany()
  }

  async findOneByUuid(uuid: string): Promise<Job | null> {
    return this.ormRepository.createQueryBuilder('job').where('uuid = :uuid', { uuid }).getOne()
  }

  async markJobAsDone(jobUuid: string): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update()
      .set({
        status: JobStatus.Done,
      })
      .where('uuid = :jobUuid', {
        jobUuid,
      })
      .execute()
  }
}
