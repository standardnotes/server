import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { FeatureIdentifier } from '@standardnotes/features'

import { Authenticator } from '../../Authenticator/Authenticator'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { FeatureServiceInterface } from '../../Feature/FeatureServiceInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { ListAuthenticatorsDTO } from './ListAuthenticatorsDTO'

export class ListAuthenticators implements UseCaseInterface<Authenticator[]> {
  constructor(
    private authenticatorRepository: AuthenticatorRepositoryInterface,
    private userRepository: UserRepositoryInterface,
    private featureService: FeatureServiceInterface,
  ) {}

  async execute(dto: ListAuthenticatorsDTO): Promise<Result<Authenticator[]>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not list authenticators: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(userUuid)
    if (user === null) {
      return Result.fail('Could not list authenticators: user not found.')
    }

    const userIsEntitledToU2F = await this.featureService.userIsEntitledToFeature(
      user,
      FeatureIdentifier.UniversalSecondFactor,
    )

    if (!userIsEntitledToU2F) {
      return Result.fail('Could not list authenticators: user is not entitled to U2F.')
    }

    const authenticators = await this.authenticatorRepository.findByUserUuid(userUuid)

    return Result.ok(authenticators)
  }
}
