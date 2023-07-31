import { UseCaseInterface } from '../UseCaseInterface'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { GetUserFeaturesDto } from './GetUserFeaturesDto'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetUserFeaturesResponse } from './GetUserFeaturesResponse'
import { FeatureServiceInterface } from '../../Feature/FeatureServiceInterface'
import { Uuid } from '@standardnotes/domain-core'

@injectable()
export class GetUserFeatures implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_FeatureService) private featureService: FeatureServiceInterface,
  ) {}

  async execute(dto: GetUserFeaturesDto): Promise<GetUserFeaturesResponse> {
    if (dto.offline) {
      const { features, roles } = await this.featureService.getFeaturesForOfflineUser(dto.email)

      return {
        success: true,
        features,
        roles,
      }
    }

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return {
        success: false,
        error: {
          message: userUuidOrError.getError(),
        },
      }
    }
    const userUuid = userUuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(userUuid)

    if (user === null) {
      return {
        success: false,
        error: {
          message: `User ${userUuid.value} not found.`,
        },
      }
    }

    const userFeatures = await this.featureService.getFeaturesForUser(user)

    return {
      success: true,
      userUuid: userUuid.value,
      features: userFeatures,
    }
  }
}
