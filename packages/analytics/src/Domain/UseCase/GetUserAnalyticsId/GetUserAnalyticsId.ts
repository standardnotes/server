import { inject, injectable } from 'inversify'
import { Email, Uuid } from '@standardnotes/domain-core'

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
    let analyticsEntity = null
    if (dto.userUuid) {
      analyticsEntity = await this.analyticsEntityRepository.findOneByUserUuid(dto.userUuid)
    } else if (dto.userEmail) {
      analyticsEntity = await this.analyticsEntityRepository.findOneByUserEmail(dto.userEmail)
    }

    if (analyticsEntity === null) {
      throw new Error(`Could not find analytics entity for user ${dto.userUuid}`)
    }

    return {
      analyticsId: analyticsEntity.id,
      userUuid: Uuid.create(analyticsEntity.userUuid).getValue(),
      userEmail: Email.create(analyticsEntity.userEmail).getValue(),
    }
  }
}
