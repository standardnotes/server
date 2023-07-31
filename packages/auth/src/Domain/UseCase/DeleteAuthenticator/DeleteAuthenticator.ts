import { Result, UniqueEntityId, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { FeatureIdentifier } from '@standardnotes/features'

import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { FeatureServiceInterface } from '../../Feature/FeatureServiceInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { DeleteAuthenticatorDTO } from './DeleteAuthenticatorDTO'

export class DeleteAuthenticator implements UseCaseInterface<string> {
  constructor(
    private authenticatorRepository: AuthenticatorRepositoryInterface,
    private userRepository: UserRepositoryInterface,
    private featureService: FeatureServiceInterface,
  ) {}

  async execute(dto: DeleteAuthenticatorDTO): Promise<Result<string>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not delete authenticator: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(userUuid)
    if (user === null) {
      return Result.fail('Could not delete authenticator: user not found.')
    }

    const userIsEntitledToU2F = await this.featureService.userIsEntitledToFeature(
      user,
      FeatureIdentifier.UniversalSecondFactor,
    )

    if (!userIsEntitledToU2F) {
      return Result.fail('Could not delete authenticator: user is not entitled to U2F.')
    }

    const authenticator = await this.authenticatorRepository.findById(new UniqueEntityId(dto.authenticatorId))
    if (!authenticator || authenticator.props.userUuid.value !== userUuid.value) {
      return Result.fail('Authenticator not found')
    }

    await this.authenticatorRepository.remove(authenticator)

    return Result.ok('Authenticator deleted')
  }
}
