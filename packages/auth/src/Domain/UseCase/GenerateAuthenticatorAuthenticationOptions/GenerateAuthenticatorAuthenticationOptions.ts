import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { generateAuthenticationOptions } from '@simplewebauthn/server'

import { GenerateAuthenticatorAuthenticationOptionsDTO } from './GenerateAuthenticatorAuthenticationOptionsDTO'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { AuthenticatorChallengeRepositoryInterface } from '../../Authenticator/AuthenticatorChallengeRepositoryInterface'
import { AuthenticatorChallenge } from '../../Authenticator/AuthenticatorChallenge'

export class GenerateAuthenticatorAuthenticationOptions implements UseCaseInterface<Record<string, unknown>> {
  constructor(
    private authenticatorRepository: AuthenticatorRepositoryInterface,
    private authenticatorChallengeRepository: AuthenticatorChallengeRepositoryInterface,
  ) {}

  async execute(dto: GenerateAuthenticatorAuthenticationOptionsDTO): Promise<Result<Record<string, unknown>>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not generate authenticator registration options: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const authenticators = await this.authenticatorRepository.findByUserUuid(userUuid)
    const options = generateAuthenticationOptions({
      allowCredentials: authenticators.map((authenticator) => ({
        id: authenticator.props.credentialId,
        type: 'public-key',
        transports: authenticator.props.transports,
      })),
      userVerification: 'preferred',
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
