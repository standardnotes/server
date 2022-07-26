import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { PredicateRepositoryInterface } from '../../Predicate/PredicateRepositoryInterface'
import { PredicateStatus } from '../../Predicate/PredicateStatus'
import { UseCaseInterface } from '../UseCaseInterface'

import { UpdatePredicateStatusDTO } from './UpdatePredicateStatusDTO'
import { UpdatePredicateStatusResponse } from './UpdatePredicateStatusResponse'

@injectable()
export class UpdatePredicateStatus implements UseCaseInterface {
  constructor(@inject(TYPES.PredicateRepository) private predicateRepository: PredicateRepositoryInterface) {}

  async execute(dto: UpdatePredicateStatusDTO): Promise<UpdatePredicateStatusResponse> {
    const predicates = await this.predicateRepository.findByJobUuid(dto.predicate.jobUuid)

    for (const predicate of predicates) {
      if (predicate.name === dto.predicate.name) {
        predicate.status = dto.predicateVerificationResult as unknown as PredicateStatus
        await this.predicateRepository.save(predicate)
      }
    }

    return {
      success: true,
    }
  }
}
