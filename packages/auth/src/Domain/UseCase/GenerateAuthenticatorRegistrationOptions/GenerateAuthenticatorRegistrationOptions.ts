import { Result, UseCaseInterface, Username, Uuid } from '@standardnotes/domain-core'
import { generateRegistrationOptions } from '@simplewebauthn/server'

import { GenerateAuthenticatorRegistrationOptionsDTO } from './GenerateAuthenticatorRegistrationOptionsDTO'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { AuthenticatorChallengeRepositoryInterface } from '../../Authenticator/AuthenticatorChallengeRepositoryInterface'
import { AuthenticatorChallenge } from '../../Authenticator/AuthenticatorChallenge'

export class GenerateAuthenticatorRegistrationOptions implements UseCaseInterface<Record<string, unknown>> {
  private readonly RP_NAME = 'Standard Notes'
  private readonly RP_ID = 'standardnotes.com'

  constructor(
    private authenticatorRepository: AuthenticatorRepositoryInterface,
    private authenticatorChallengeRepository: AuthenticatorChallengeRepositoryInterface,
  ) {}

  async execute(dto: GenerateAuthenticatorRegistrationOptionsDTO): Promise<Result<Record<string, unknown>>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not generate authenticator registration options: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const usernameOrError = Username.create(dto.username)
    if (usernameOrError.isFailed()) {
      return Result.fail(`Could not generate authenticator registration options: ${usernameOrError.getError()}`)
    }
    const username = usernameOrError.getValue()

    const authenticators = await this.authenticatorRepository.findByUserUuid(userUuid)
    const options = generateRegistrationOptions({
      rpID: this.RP_ID,
      rpName: this.RP_NAME,
      userID: userUuid.value,
      userName: username.value,
      attestationType: 'none',
      excludeCredentials: authenticators.map((authenticator) => ({
        id: authenticator.props.credentialId,
        type: 'public-key',
        transports: authenticator.props.transports,
      })),
    })

    const authenticatorChallengeOrError = AuthenticatorChallenge.create({
      challenge: options.challenge,
      userUuid,
      createdAt: new Date(),
    })
    if (authenticatorChallengeOrError.isFailed()) {
      return Result.fail(
        `Could not generate authenticator registration options: ${authenticatorChallengeOrError.getError()}`,
      )
    }
    const authenticatorChallenge = authenticatorChallengeOrError.getValue()

    await this.authenticatorChallengeRepository.save(authenticatorChallenge)

    return Result.ok(options)
  }
}
