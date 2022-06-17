import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { JobDoneInterpreterInterface } from '../../Job/JobDoneInterpreterInterface'
import { JobRepositoryInterface } from '../../Job/JobRepositoryInterface'
import { PredicateRepositoryInterface } from '../../Predicate/PredicateRepositoryInterface'
import { PredicateStatus } from '../../Predicate/PredicateStatus'
import { UseCaseInterface } from '../UseCaseInterface'

import { VerifyPredicatesDTO } from './VerifyPredicatesDTO'
import { VerifyPredicatesResponse } from './VerifyPredicatesResponse'

@injectable()
export class VerifyPredicates implements UseCaseInterface {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: JobRepositoryInterface,
    @inject(TYPES.PredicateRepository) private predicateRepository: PredicateRepositoryInterface,
    @inject(TYPES.JobDoneInterpreter) private jobDoneInterpreter: JobDoneInterpreterInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
  ) {}

  async execute(dto: VerifyPredicatesDTO): Promise<VerifyPredicatesResponse> {
    const jobs = await this.jobRepository.findPendingOverdue(dto.timestamp)

    for (const job of jobs) {
      const predicates = await this.predicateRepository.findByJobUuid(job.uuid)
      let allPredicatesCompleted = true
      for (const predicate of predicates) {
        if (predicate.status === PredicateStatus.Pending) {
          allPredicatesCompleted = false
          await this.domainEventPublisher.publish(
            this.domainEventFactory.createPredicateVerificationRequestedEvent(job, predicate),
          )
        }
      }

      if (allPredicatesCompleted) {
        await this.jobDoneInterpreter.interpret(job.uuid)
        await this.jobRepository.markJobAsDone(job.uuid)
      }
    }

    return {
      success: true,
    }
  }
}
