import { inject, injectable } from 'inversify'
import { Result, UseCaseInterface, Username, Uuid } from '@standardnotes/domain-core'

import TYPES from '../../../Bootstrap/Types'
import { AnalyticsEntityRepositoryInterface } from '../../Entity/AnalyticsEntityRepositoryInterface'
import { GetUserAnalyticsIdDTO } from './GetUserAnalyticsIdDTO'
import { GetUserAnalyticsIdResponse } from './GetUserAnalyticsIdResponse'

@injectable()
export class GetUserAnalyticsId implements UseCaseInterface<GetUserAnalyticsIdResponse> {
  constructor(
    @inject(TYPES.AnalyticsEntityRepository) private analyticsEntityRepository: AnalyticsEntityRepositoryInterface,
  ) {}

  async execute(dto: GetUserAnalyticsIdDTO): Promise<Result<GetUserAnalyticsIdResponse>> {
    let analyticsEntity = null
    if (dto.userUuid) {
      analyticsEntity = await this.analyticsEntityRepository.findOneByUserUuid(dto.userUuid)
    } else if (dto.userEmail) {
      analyticsEntity = await this.analyticsEntityRepository.findOneByUserEmail(dto.userEmail)
    }

    if (analyticsEntity === null) {
      return Result.fail(`Could not find analytics entity ${dto.userUuid}`)
    }

    return Result.ok({
      analyticsId: analyticsEntity.id,
      userUuid: Uuid.create(analyticsEntity.userUuid).getValue(),
      username: Username.create(analyticsEntity.username).getValue(),
    })
  }
}
