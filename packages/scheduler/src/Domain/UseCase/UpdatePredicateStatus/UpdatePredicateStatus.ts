import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { JobDoneInterpreterInterface } from '../../Job/JobDoneInterpreterInterface'
import { JobRepositoryInterface } from '../../Job/JobRepositoryInterface'
import { PredicateRepositoryInterface } from '../../Predicate/PredicateRepositoryInterface'
import { PredicateStatus } from '../../Predicate/PredicateStatus'
import { UseCaseInterface } from '../UseCaseInterface'

import { UpdatePredicateStatusDTO } from './UpdatePredicateStatusDTO'
import { UpdatePredicateStatusResponse } from './UpdatePredicateStatusResponse'

@injectable()
export class UpdatePredicateStatus implements UseCaseInterface {
  constructor(
    @inject(TYPES.PredicateRepository) private predicateRepository: PredicateRepositoryInterface,
    @inject(TYPES.JobRepository) private jobRepository: JobRepositoryInterface,
    @inject(TYPES.JobDoneInterpreter) private jobDoneInterpreter: JobDoneInterpreterInterface,
  ) {}

  async execute(dto: UpdatePredicateStatusDTO): Promise<UpdatePredicateStatusResponse> {
    const predicates = await this.predicateRepository.findByJobUuid(dto.predicate.jobUuid)

    let allPredicatesChecked = true
    for (const predicate of predicates) {
      if (predicate.name === dto.predicate.name) {
        predicate.status = dto.predicateVerificationResult as unknown as PredicateStatus
        await this.predicateRepository.save(predicate)
      }
      if (predicate.status === PredicateStatus.Pending) {
        allPredicatesChecked = false
      }
    }

    if (allPredicatesChecked) {
      await this.jobDoneInterpreter.interpret(dto.predicate.jobUuid)

      await this.jobRepository.markJobAsDone(dto.predicate.jobUuid)
    }

    return {
      success: true,
      allPredicatesChecked,
    }
  }
}
