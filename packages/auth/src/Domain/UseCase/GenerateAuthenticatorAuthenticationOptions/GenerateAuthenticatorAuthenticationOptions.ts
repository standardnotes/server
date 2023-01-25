import * as crypto from 'crypto'
import { Result, UseCaseInterface, Username, Uuid } from '@standardnotes/domain-core'
import { generateAuthenticationOptions } from '@simplewebauthn/server'

import { GenerateAuthenticatorAuthenticationOptionsDTO } from './GenerateAuthenticatorAuthenticationOptionsDTO'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { AuthenticatorChallengeRepositoryInterface } from '../../Authenticator/AuthenticatorChallengeRepositoryInterface'
import { AuthenticatorChallenge } from '../../Authenticator/AuthenticatorChallenge'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

export class GenerateAuthenticatorAuthenticationOptions implements UseCaseInterface<Record<string, unknown>> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private authenticatorRepository: AuthenticatorRepositoryInterface,
    private authenticatorChallengeRepository: AuthenticatorChallengeRepositoryInterface,
    private pseudoKeyParamsKey: string,
  ) {}

  async execute(dto: GenerateAuthenticatorAuthenticationOptionsDTO): Promise<Result<Record<string, unknown>>> {
    const usernameOrError = Username.create(dto.username)
    if (usernameOrError.isFailed()) {
      return Result.fail(`Could not generate authenticator registration options: ${usernameOrError.getError()}`)
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByEmail(username.value)
    if (user === null) {
      const credentialIdHash = crypto
        .createHash('sha256')
        .update(`u2f-selector-${dto.username}${this.pseudoKeyParamsKey}`)
        .digest('base64url')

      const options = generateAuthenticationOptions({
        allowCredentials: [
          {
            id: Buffer.from(credentialIdHash),
            type: 'public-key',
            transports: [],
          },
        ],
        userVerification: 'preferred',
      })

      return Result.ok(options)
    }

    const userUuidOrError = Uuid.create(user.uuid)
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
