import * as crypto from 'crypto'
import { ErrorTag } from '@standardnotes/common'
import { SettingName } from '@standardnotes/settings'
import { v4 as uuidv4 } from 'uuid'
import { inject, injectable } from 'inversify'
import { authenticator } from 'otplib'

import TYPES from '../../Bootstrap/Types'
import { MFAValidationError } from '../Error/MFAValidationError'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UseCaseInterface } from './UseCaseInterface'
import { VerifyMFADTO } from './VerifyMFADTO'
import { VerifyMFAResponse } from './VerifyMFAResponse'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { SelectorInterface } from '@standardnotes/auth'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'

@injectable()
export class VerifyMFA implements UseCaseInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.BooleanSelector) private booleanSelector: SelectorInterface<boolean>,
    @inject(TYPES.LockRepository) private lockRepository: LockRepositoryInterface,
    @inject(TYPES.PSEUDO_KEY_PARAMS_KEY) private pseudoKeyParamsKey: string,
  ) {}

  async execute(dto: VerifyMFADTO): Promise<VerifyMFAResponse> {
    try {
      const user = await this.userRepository.findOneByEmail(dto.email)
      if (user == null) {
        const mfaSelectorHash = crypto
          .createHash('sha256')
          .update(`mfa-selector-${dto.email}${this.pseudoKeyParamsKey}`)
          .digest('hex')

        const isPseudoMFARequired = this.booleanSelector.select(mfaSelectorHash, [true, false])

        return isPseudoMFARequired
          ? {
              success: false,
              errorTag: ErrorTag.MfaRequired,
              errorMessage: 'Please enter your two-factor authentication code.',
              errorPayload: { mfa_key: `mfa_${uuidv4()}` },
            }
          : {
              success: true,
            }
      }

      const mfaSecret = await this.settingService.findSettingWithDecryptedValue({
        userUuid: user.uuid,
        settingName: SettingName.MfaSecret,
      })
      if (mfaSecret === null || mfaSecret.value === null) {
        return {
          success: true,
        }
      }

      const verificationResult = await this.verifyMFASecret(
        dto.email,
        mfaSecret.value,
        dto.requestParams,
        dto.preventOTPFromFurtherUsage,
      )

      return verificationResult
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
