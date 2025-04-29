import * as crypto from 'crypto'
import { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types'
import { ErrorTag } from '@standardnotes/responses'
import { v4 as uuidv4 } from 'uuid'
import { authenticator } from 'otplib'
import { SelectorInterface } from '@standardnotes/security'
import { SettingName, Username, Uuid } from '@standardnotes/domain-core'

import { MFAValidationError } from '../Error/MFAValidationError'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'
import { AuthenticatorRepositoryInterface } from '../Authenticator/AuthenticatorRepositoryInterface'

import { UseCaseInterface } from './UseCaseInterface'
import { VerifyMFADTO } from './VerifyMFADTO'
import { VerifyMFAResponse } from './VerifyMFAResponse'
import { Logger } from 'winston'
import { GetSetting } from './GetSetting/GetSetting'
import { VerifyAuthenticatorAuthenticationResponse } from './VerifyAuthenticatorAuthenticationResponse/VerifyAuthenticatorAuthenticationResponse'

export class VerifyMFA implements UseCaseInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private booleanSelector: SelectorInterface<boolean>,
    private lockRepository: LockRepositoryInterface,
    private pseudoKeyParamsKey: string,
    private authenticatorRepository: AuthenticatorRepositoryInterface,
    private verifyAuthenticatorAuthenticationResponse: VerifyAuthenticatorAuthenticationResponse,
    private getSetting: GetSetting,
    private logger: Logger,
  ) {}

  async execute(dto: VerifyMFADTO): Promise<VerifyMFAResponse> {
    try {
      const usernameOrError = Username.create(dto.email, { skipValidation: true })
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
        const secondFactorSelectorHash = crypto
          .createHash('sha256')
          .update(`second-factor-selector-${dto.email}${this.pseudoKeyParamsKey}`)
          .digest('hex')

        const isPseudoSecondFactorRequired = this.booleanSelector.select(secondFactorSelectorHash, [true, false])
        if (isPseudoSecondFactorRequired) {
          const u2fSelectorHash = crypto
            .createHash('sha256')
            .update(`u2f-selector-${dto.email}${this.pseudoKeyParamsKey}`)
            .digest('hex')

          const isPseudoU2FRequired = this.booleanSelector.select(u2fSelectorHash, [true, false])

          if (isPseudoU2FRequired) {
            return {
              success: false,
              errorTag: ErrorTag.U2FRequired,
              errorMessage: 'Please authenticate with your U2F device.',
            }
          } else {
            return {
              success: false,
              errorTag: ErrorTag.MfaRequired,
              errorMessage: 'Please enter your two-factor authentication code.',
              errorPayload: { mfa_key: `mfa_${uuidv4()}` },
            }
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

      const mfaSecretOrError = await this.getSetting.execute({
        userUuid: userUuid.value,
        settingName: SettingName.NAMES.MfaSecret,
        allowSensitiveRetrieval: true,
        decrypted: true,
      })
      const twoFactorEnabled = !mfaSecretOrError.isFailed() && mfaSecretOrError.getValue().decryptedValue !== null

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
          authenticatorResponse: dto.requestParams.authenticator_response as AuthenticationResponseJSON,
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
          mfaSecretOrError.getValue().decryptedValue as string,
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
