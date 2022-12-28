import { Dates, Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { verifyRegistrationResponse } from '@simplewebauthn/server'

import { AuthenticatorChallengeRepositoryInterface } from '../../Authenticator/AuthenticatorChallengeRepositoryInterface'
import { RelyingParty } from '../../Authenticator/RelyingParty'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { Authenticator } from '../../Authenticator/Authenticator'
import { VerifyAuthenticatorRegistrationResponseDTO } from './VerifyAuthenticatorRegistrationResponseDTO'

export class VerifyAuthenticatorRegistrationResponse implements UseCaseInterface<boolean> {
  constructor(
    private authenticatorRepository: AuthenticatorRepositoryInterface,
    private authenticatorChallengeRepository: AuthenticatorChallengeRepositoryInterface,
  ) {}

  async execute(dto: VerifyAuthenticatorRegistrationResponseDTO): Promise<Result<boolean>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not verify authenticator registration response: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const authenticatorChallenge = await this.authenticatorChallengeRepository.findByUserUuidAndChallenge(
      userUuid,
      dto.challenge,
    )
    if (!authenticatorChallenge) {
      return Result.fail('Could not verify authenticator registration response: challenge not found')
    }

    const verification = await verifyRegistrationResponse({
      credential: dto.registrationCredential,
      expectedChallenge: authenticatorChallenge.props.challenge.toString(),
      expectedOrigin: `https://${RelyingParty.RP_ID}`,
      expectedRPID: RelyingParty.RP_ID,
    })

    if (!verification.verified) {
      return Result.fail('Could not verify authenticator registration response: verification failed')
    }

    const authenticatorOrError = Authenticator.create({
      userUuid,
      counter: verification.registrationInfo?.counter as number,
      credentialBackedUp: verification.registrationInfo?.credentialBackedUp as boolean,
      credentialDeviceType: verification.registrationInfo?.credentialDeviceType,
      credentialId: verification.registrationInfo?.credentialID as Buffer,
      credentialPublicKey: verification.registrationInfo?.credentialPublicKey as Buffer,
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
