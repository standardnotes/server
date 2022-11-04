import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { AnalyticsEntityRepositoryInterface } from '../../Entity/AnalyticsEntityRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { GetUserAnalyticsIdDTO } from './GetUserAnalyticsIdDTO'
import { GetUserAnalyticsIdResponse } from './GetUserAnalyticsIdResponse'

@injectable()
export class GetUserAnalyticsId implements UseCaseInterface {
  constructor(
    @inject(TYPES.AnalyticsEntityRepository) private analyticsEntityRepository: AnalyticsEntityRepositoryInterface,
  ) {}

  async execute(dto: GetUserAnalyticsIdDTO): Promise<GetUserAnalyticsIdResponse> {
    const analyticsEntity = await this.analyticsEntityRepository.findOneByUserUuid(dto.userUuid)

    if (analyticsEntity === null) {
      throw new Error(`Could not find analytics entity for user ${dto.userUuid}`)
    }

    return {
      analyticsId: analyticsEntity.id,
    }
  }
}
