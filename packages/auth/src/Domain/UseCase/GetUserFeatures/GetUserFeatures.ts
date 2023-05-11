import { UseCaseInterface } from '../UseCaseInterface'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { GetUserFeaturesDto } from './GetUserFeaturesDto'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetUserFeaturesResponse } from './GetUserFeaturesResponse'
import { FeatureServiceInterface } from '../../Feature/FeatureServiceInterface'

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

    const user = await this.userRepository.findOneByUuid(dto.userUuid)

    if (user === null) {
      return {
        success: false,
        error: {
          message: `User ${dto.userUuid} not found.`,
        },
      }
    }

    const userFeatures = await this.featureService.getFeaturesForUser(user)

    return {
      success: true,
      userUuid: dto.userUuid,
      features: userFeatures,
    }
  }
}
