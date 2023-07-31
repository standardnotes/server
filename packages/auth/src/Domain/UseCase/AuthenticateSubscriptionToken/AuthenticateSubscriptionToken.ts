import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { SubscriptionTokenRepositoryInterface } from '../../Subscription/SubscriptionTokenRepositoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { AuthenticateSubscriptionTokenDTO } from './AuthenticateSubscriptionTokenDTO'
import { AuthenticateSubscriptionTokenResponse } from './AuthenticateSubscriptionTokenResponse'
import { Uuid } from '@standardnotes/domain-core'

@injectable()
export class AuthenticateSubscriptionToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_SubscriptionTokenRepository)
    private subscriptionTokenRepository: SubscriptionTokenRepositoryInterface,
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
  ) {}

  async execute(dto: AuthenticateSubscriptionTokenDTO): Promise<AuthenticateSubscriptionTokenResponse> {
    const userUuidString = await this.subscriptionTokenRepository.getUserUuidByToken(dto.token)
    const userUuidOrError = Uuid.create(userUuidString as string)
    if (userUuidOrError.isFailed()) {
      return {
        success: false,
      }
    }
    const userUuid = userUuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(userUuid)
    if (user === null) {
      return {
        success: false,
      }
    }

    return {
      success: true,
      user,
    }
  }
}
