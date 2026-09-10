import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse } from '@simplewebauthn/server'
import { AuthenticatorDevice } from '@simplewebauthn/typescript-types'

import { AuthenticatorChallengeRepositoryInterface } from '../../Authenticator/AuthenticatorChallengeRepositoryInterface'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { VerifyAuthenticatorAuthenticationResponseDTO } from './VerifyAuthenticatorAuthenticationResponseDTO'

export class VerifyAuthenticatorAuthenticationResponse implements UseCaseInterface<boolean> {
  constructor(
    private authenticatorRepository: AuthenticatorRepositoryInterface,
    private authenticatorChallengeRepository: AuthenticatorChallengeRepositoryInterface,
    private relyingPartyId: string,
    private expectedOrigin: string[],
    private requireUserVerification: boolean,
    private authenticatorChallengeMaxAgeSeconds: number,
  ) {}

  async execute(dto: VerifyAuthenticatorAuthenticationResponseDTO): Promise<Result<boolean>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not verify authenticator authentication response: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const authenticatorChallenge = await this.authenticatorChallengeRepository.findByUserUuid(userUuid)
    if (!authenticatorChallenge) {
      return Result.fail('Could not verify authenticator authentication response: challenge not found')
    }

    if (authenticatorChallenge.isExpired(this.authenticatorChallengeMaxAgeSeconds)) {
      await this.authenticatorChallengeRepository.deleteByUserUuid(userUuid)

      return Result.fail('Could not verify authenticator authentication response: challenge expired')
    }

    const expectedChallenge = authenticatorChallenge.props.challenge.toString()
    const deletedRows = await this.authenticatorChallengeRepository.deleteByUserUuid(userUuid)
    if (deletedRows === 0) {
      return Result.fail('Could not verify authenticator authentication response: challenge already consumed')
    }

    const authenticator = await this.authenticatorRepository.findByUserUuidAndCredentialId(
      userUuid,
      dto.authenticatorResponse.id as string,
    )
    if (!authenticator) {
      return Result.fail(
        `Could not verify authenticator authentication response: authenticator ${dto.authenticatorResponse.id} not found`,
      )
    }

    let verification: VerifiedAuthenticationResponse
    try {
      verification = await verifyAuthenticationResponse({
        response: dto.authenticatorResponse,
        expectedChallenge,
        expectedOrigin: this.expectedOrigin,
        expectedRPID: this.relyingPartyId,
        requireUserVerification: this.requireUserVerification,
        authenticator: {
          counter: authenticator.props.counter,
          credentialID: authenticator.props.credentialId,
          credentialPublicKey: authenticator.props.credentialPublicKey,
          transports: authenticator.props.transports,
        } as AuthenticatorDevice,
      })

      if (!verification.verified) {
        return Result.fail('Could not verify authenticator authentication response: verification failed')
      }
    } catch (error) {
      return Result.fail(`Could not verify authenticator authentication response: ${(error as Error).message}`)
    }

    await this.authenticatorRepository.updateCounter(authenticator.id, verification.authenticationInfo.newCounter)

    return Result.ok(true)
  }
}
