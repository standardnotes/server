import * as crypto from 'crypto'
import { ErrorTag } from '@standardnotes/responses'
import { SettingName } from '@standardnotes/settings'
import { v4 as uuidv4 } from 'uuid'
import { inject, injectable } from 'inversify'
import { authenticator } from 'otplib'
import { SelectorInterface } from '@standardnotes/security'
import { UseCaseInterface as DomainUseCaseInterface, Username, Uuid } from '@standardnotes/domain-core'

import TYPES from '../../Bootstrap/Types'
import { MFAValidationError } from '../Error/MFAValidationError'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'
import { AuthenticatorRepositoryInterface } from '../Authenticator/AuthenticatorRepositoryInterface'

import { UseCaseInterface } from './UseCaseInterface'
import { VerifyMFADTO } from './VerifyMFADTO'
import { VerifyMFAResponse } from './VerifyMFAResponse'
import { Logger } from 'winston'
import { Setting } from '../Setting/Setting'

@injectable()
export class VerifyMFA implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.BooleanSelector) private booleanSelector: SelectorInterface<boolean>,
    @inject(TYPES.LockRepository) private lockRepository: LockRepositoryInterface,
    @inject(TYPES.PSEUDO_KEY_PARAMS_KEY) private pseudoKeyParamsKey: string,
    @inject(TYPES.AuthenticatorRepository) private authenticatorRepository: AuthenticatorRepositoryInterface,
    @inject(TYPES.VerifyAuthenticatorAuthenticationResponse)
    private verifyAuthenticatorAuthenticationResponse: DomainUseCaseInterface<boolean>,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: VerifyMFADTO): Promise<VerifyMFAResponse> {
    try {
      const usernameOrError = Username.create(dto.email)
      if (usernameOrError.isFailed()) {
        return {
          success: false,
          errorTag: ErrorTag.AuthInvalid,
          errorMessage: usernameOrError.getError(),
        }
      }
      const username = usernameOrError.getValue()

      const user = await this.userRepository.findOneByUsernameOrEmail(username)
      if (user == null) {
        const mfaSelectorHash = crypto
          .createHash('sha256')
          .update(`mfa-selector-${dto.email}${this.pseudoKeyParamsKey}`)
          .digest('hex')
        const u2fSelectorHash = crypto
          .createHash('sha256')
          .update(`u2f-selector-${dto.email}${this.pseudoKeyParamsKey}`)
          .digest('hex')

        const isPseudoMFARequired = this.booleanSelector.select(mfaSelectorHash, [true, false])

        const isPseudoU2FRequired = this.booleanSelector.select(u2fSelectorHash, [true, false])

        if (isPseudoMFARequired) {
          return {
            success: false,
            errorTag: ErrorTag.MfaRequired,
            errorMessage: 'Please enter your two-factor authentication code.',
            errorPayload: { mfa_key: `mfa_${uuidv4()}` },
          }
        }

        if (isPseudoU2FRequired) {
          return {
            success: false,
            errorTag: ErrorTag.U2FRequired,
            errorMessage: 'Please authenticate with your U2F device.',
          }
        }

        return {
          success: true,
        }
      }

      const userUuidOrError = Uuid.create(user.uuid)
      if (userUuidOrError.isFailed()) {
        return {
          success: false,
          errorMessage: 'User UUID is invalid.',
        }
      }
      const userUuid = userUuidOrError.getValue()

      let u2fEnabled = false
      const u2fAuthenticators = await this.authenticatorRepository.findByUserUuid(userUuid)
      if (u2fAuthenticators.length > 0) {
        u2fEnabled = true
      }

      const mfaSecret = await this.settingService.findSettingWithDecryptedValue({
        userUuid: user.uuid,
        settingName: SettingName.create(SettingName.NAMES.MfaSecret).getValue(),
      })
      const twoFactorEnabled = mfaSecret !== null && mfaSecret.value !== null

      if (u2fEnabled === false && twoFactorEnabled === false) {
        return {
          success: true,
        }
      }

      if (u2fEnabled) {
        if (!dto.requestParams.authenticator_response) {
          return {
            success: false,
            errorTag: ErrorTag.U2FRequired,
            errorMessage: 'Please authenticate with your U2F device.',
          }
        }

        const verificationResultOrError = await this.verifyAuthenticatorAuthenticationResponse.execute({
          userUuid: userUuid.value,
          authenticatorResponse: dto.requestParams.authenticator_response,
        })
        if (verificationResultOrError.isFailed()) {
          this.logger.debug(`Could not verify U2F authentication: ${verificationResultOrError.getError()}`)

          return {
            success: false,
            errorTag: ErrorTag.MfaInvalid,
            errorMessage: 'Could not verify U2F device.',
          }
        }

        const verificationResult = verificationResultOrError.getValue()
        if (verificationResult === false) {
          return {
            success: false,
            errorTag: ErrorTag.MfaInvalid,
            errorMessage: 'Could not verify U2F device.',
          }
        }

        return {
          success: true,
        }
      } else {
        const verificationResult = await this.verifyMFASecret(
          dto.email,
          (mfaSecret as Setting).value as string,
          dto.requestParams,
          dto.preventOTPFromFurtherUsage,
        )

        return verificationResult
      }
    } catch (error) {
      if (error instanceof MFAValidationError) {
        return {
          success: false,
          errorTag: error.tag,
          errorMessage: error.message,
          errorPayload: error.payload,
        }
      }

      throw error
    }
  }

  private getMFATokenAndParamKeyFromRequestParams(requestParams: Record<string, unknown>): {
    key: string
    token: string
  } {
    let mfaParamKey = null
    for (const key of Object.keys(requestParams)) {
      if (key.startsWith('mfa_')) {
        mfaParamKey = key
        break
      }
    }

    if (mfaParamKey === null) {
      throw new MFAValidationError('Please enter your two-factor authentication code.', ErrorTag.MfaRequired, {
        mfa_key: `mfa_${uuidv4()}`,
      })
    }

    return {
      token: requestParams[mfaParamKey] as string,
      key: mfaParamKey,
    }
  }

  private async verifyMFASecret(
    email: string,
    secret: string,
    requestParams: Record<string, unknown>,
    preventOTPFromFurtherUsage: boolean,
  ): Promise<VerifyMFAResponse> {
    const tokenAndParamKey = this.getMFATokenAndParamKeyFromRequestParams(requestParams)

    const isOTPAlreadyUsed = await this.lockRepository.isOTPLocked(email, tokenAndParamKey.token)
    if (isOTPAlreadyUsed) {
      throw new MFAValidationError(
        'The two-factor authentication code you entered has been already utilized. Please try again in a while.',
        ErrorTag.MfaInvalid,
        { mfa_key: tokenAndParamKey.key },
      )
    }

    if (!authenticator.verify({ token: tokenAndParamKey.token, secret })) {
      throw new MFAValidationError(
        'The two-factor authentication code you entered is incorrect. Please try again.',
        ErrorTag.MfaInvalid,
        { mfa_key: tokenAndParamKey.key },
      )
    }

    if (preventOTPFromFurtherUsage) {
      await this.lockRepository.lockSuccessfullOTP(email, tokenAndParamKey.token)
    }

    return {
      success: true,
    }
  }
}
