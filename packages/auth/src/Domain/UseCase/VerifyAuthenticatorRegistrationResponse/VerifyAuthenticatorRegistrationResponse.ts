import { Dates, Result, UseCaseInterface, Uuid, Validator } from '@standardnotes/domain-core'
import { VerifiedRegistrationResponse, verifyRegistrationResponse } from '@simplewebauthn/server'

import { AuthenticatorChallengeRepositoryInterface } from '../../Authenticator/AuthenticatorChallengeRepositoryInterface'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { Authenticator } from '../../Authenticator/Authenticator'
import { VerifyAuthenticatorRegistrationResponseDTO } from './VerifyAuthenticatorRegistrationResponseDTO'

export class VerifyAuthenticatorRegistrationResponse implements UseCaseInterface<boolean> {
  constructor(
    private authenticatorRepository: AuthenticatorRepositoryInterface,
    private authenticatorChallengeRepository: AuthenticatorChallengeRepositoryInterface,
    private relyingPartyId: string[],
    private expectedOrigin: string[],
    private requireUserVerification: boolean,
  ) {}

  async execute(dto: VerifyAuthenticatorRegistrationResponseDTO): Promise<Result<boolean>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not verify authenticator registration response: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const nameValidation = Validator.isNotEmpty(dto.name)
    if (nameValidation.isFailed()) {
      return Result.fail(`Could not verify authenticator registration response: ${nameValidation.getError()}`)
    }

    const authenticatorChallenge = await this.authenticatorChallengeRepository.findByUserUuid(userUuid)
    if (!authenticatorChallenge) {
      return Result.fail('Could not verify authenticator registration response: challenge not found')
    }

    let verification: VerifiedRegistrationResponse
    try {
      verification = await verifyRegistrationResponse({
        response: dto.attestationResponse,
        expectedChallenge: authenticatorChallenge.props.challenge.toString(),
        expectedOrigin: this.expectedOrigin,
        expectedRPID: this.relyingPartyId,
        requireUserVerification: this.requireUserVerification,
      })

      if (!verification.verified) {
        return Result.fail('Could not verify authenticator registration response: verification failed')
      }
    } catch (error) {
      return Result.fail(`Could not verify authenticator registration response: ${(error as Error).message}`)
    }

    if (!verification.registrationInfo) {
      return Result.fail('Could not verify authenticator registration response: registration info not found')
    }

    const authenticatorOrError = Authenticator.create({
      userUuid,
      name: dto.name,
      counter: verification.registrationInfo.counter,
      credentialBackedUp: verification.registrationInfo.credentialBackedUp,
      credentialDeviceType: verification.registrationInfo.credentialDeviceType,
      credentialId: verification.registrationInfo.credentialID,
      credentialPublicKey: verification.registrationInfo.credentialPublicKey,
      dates: Dates.create(new Date(), new Date()).getValue(),
    })

    if (authenticatorOrError.isFailed()) {
      return Result.fail(`Could not verify authenticator registration response: ${authenticatorOrError.getError()}`)
    }
    const authenticator = authenticatorOrError.getValue()

    await this.authenticatorRepository.save(authenticator)

    return Result.ok(true)
  }
}
