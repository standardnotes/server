import * as bcrypt from 'bcryptjs'
import { Result, SettingName, Username, Uuid, Validator } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { CrypterInterface } from '../../Encryption/CrypterInterface'
import { PKCERepositoryInterface } from '../../User/PKCERepositoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GenerateRecoveryCodes } from '../GenerateRecoveryCodes/GenerateRecoveryCodes'

import { SignInWithRecoveryCodesDTO } from './SignInWithRecoveryCodesDTO'
import { SignInWithRecoveryCodesResponse } from './SignInWithRecoveryCodesResponse'
import { AuthResponseFactory20200115 } from '../../Auth/AuthResponseFactory20200115'
import { IncreaseLoginAttempts } from '../IncreaseLoginAttempts'
import { ClearLoginAttempts } from '../ClearLoginAttempts'
import { DeleteSetting } from '../DeleteSetting/DeleteSetting'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { ApiVersion } from '../../Api/ApiVersion'
import { GetSetting } from '../GetSetting/GetSetting'
import { LockRepositoryInterface } from '../../User/LockRepositoryInterface'
import { VerifyHumanInteraction } from '../VerifyHumanInteraction/VerifyHumanInteraction'
import { UseCaseInterface } from '../UseCaseInterface'

export class SignInWithRecoveryCodes implements UseCaseInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private authResponseFactory: AuthResponseFactory20200115,
    private pkceRepository: PKCERepositoryInterface,
    private crypter: CrypterInterface,
    private getSetting: GetSetting,
    private generateRecoveryCodes: GenerateRecoveryCodes,
    private increaseLoginAttempts: IncreaseLoginAttempts,
    private clearLoginAttempts: ClearLoginAttempts,
    private deleteSetting: DeleteSetting,
    private authenticatorRepository: AuthenticatorRepositoryInterface,
    private maxNonCaptchaAttempts: number,
    private lockRepository: LockRepositoryInterface,
    private verifyHumanInteractionUseCase: VerifyHumanInteraction,
    private logger: Logger,
  ) {}

  async execute(dto: SignInWithRecoveryCodesDTO): Promise<SignInWithRecoveryCodesResponse> {
    const apiVersionOrError = ApiVersion.create(dto.apiVersion)
    if (apiVersionOrError.isFailed()) {
      return this.failAfterIncrementingLoginAttempts(dto.username, apiVersionOrError.getError())
    }
    const apiVersion = apiVersionOrError.getValue()

    if (!apiVersion.isSupportedForRecoverySignIn()) {
      return this.failAfterIncrementingLoginAttempts(dto.username, 'Unsupported api version')
    }

    const usernameOrError = Username.create(dto.username)
    if (usernameOrError.isFailed()) {
      return this.failAfterIncrementingLoginAttempts(
        dto.username,
        `Could not sign in with recovery codes: ${usernameOrError.getError()}`,
      )
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)
    const userIdentifier = user?.uuid

    const humanVerificationBeforeCheckingUsernameAndPasswordResult = await this.checkHumanVerificationIfNeeded(
      userIdentifier,
      dto.hvmToken,
    )
    if (humanVerificationBeforeCheckingUsernameAndPasswordResult.isFailed()) {
      return {
        success: false,
        errorMessage: humanVerificationBeforeCheckingUsernameAndPasswordResult.getError(),
        isNonCaptchaLimitReached: true,
      }
    }

    if (!user) {
      this.logger.debug(`User with username ${username.value} was not found`)

      return this.failAfterIncrementingLoginAttempts(username.value, 'Invalid code verifier')
    }

    const validCodeVerifier = await this.validateCodeVerifier(dto.codeVerifier, user.uuid)
    if (!validCodeVerifier) {
      this.logger.debug('Code verifier does not match')

      return this.failAfterIncrementingLoginAttempts(username.value, 'Invalid code verifier')
    }

    const passwordValidationResult = Validator.isNotEmpty(dto.password)
    if (passwordValidationResult.isFailed()) {
      return this.failAfterIncrementingLoginAttempts(username.value, 'Empty password')
    }

    const recoveryCodesValidationResult = Validator.isNotEmpty(dto.recoveryCodes)
    if (recoveryCodesValidationResult.isFailed()) {
      return this.failAfterIncrementingLoginAttempts(username.value, 'Empty recovery codes')
    }

    const userUuidOrError = Uuid.create(user.uuid)
    if (userUuidOrError.isFailed()) {
      return this.failAfterIncrementingLoginAttempts(username.value, 'Invalid user uuid')
    }
    const userUuid = userUuidOrError.getValue()

    const passwordMatches = await bcrypt.compare(dto.password, user.encryptedPassword)
    if (!passwordMatches) {
      return this.failAfterIncrementingLoginAttempts(username.value, 'Invalid password')
    }

    const recoveryCodesSettingOrError = await this.getSetting.execute({
      settingName: SettingName.NAMES.RecoveryCodes,
      userUuid: user.uuid,
      decrypted: true,
      allowSensitiveRetrieval: true,
    })
    if (recoveryCodesSettingOrError.isFailed()) {
      return this.failAfterIncrementingLoginAttempts(username.value, 'User does not have recovery codes generated')
    }
    const recoveryCodesSetting = recoveryCodesSettingOrError.getValue()

    if (recoveryCodesSetting.decryptedValue !== dto.recoveryCodes) {
      return this.failAfterIncrementingLoginAttempts(username.value, 'Invalid recovery codes')
    }

    const generateNewRecoveryCodesResult = await this.generateRecoveryCodes.execute({
      userUuid: user.uuid,
    })
    if (generateNewRecoveryCodesResult.isFailed()) {
      return this.failAfterIncrementingLoginAttempts(
        username.value,
        `Could not sign in with recovery codes: ${generateNewRecoveryCodesResult.getError()}`,
      )
    }

    const authResponseCreationResult = await this.authResponseFactory.createResponse({
      user,
      apiVersion,
      userAgent: dto.userAgent,
      ephemeralSession: false,
      readonlyAccess: false,
      snjs: dto.snjs,
      application: dto.application,
    })

    await this.deleteSetting.execute({
      settingName: SettingName.NAMES.MfaSecret,
      userUuid: user.uuid,
    })

    await this.authenticatorRepository.removeByUserUuid(userUuid)

    await this.clearLoginAttempts.execute({ email: username.value })

    return {
      success: true,
      result: authResponseCreationResult,
    }
  }

  private async failAfterIncrementingLoginAttempts(
    email: string,
    errorMessage: string,
  ): Promise<SignInWithRecoveryCodesResponse> {
    const increaseResultOrError = await this.increaseLoginAttempts.execute({
      email,
      skipUsernameValidation: true,
    })

    return {
      success: false,
      errorMessage,
      isNonCaptchaLimitReached: increaseResultOrError.isFailed()
        ? undefined
        : increaseResultOrError.getValue().isNonCaptchaLimitReached,
    }
  }

  private async validateCodeVerifier(codeVerifier: string, userUuid: string): Promise<boolean> {
    const codeEmptinessVerificationResult = Validator.isNotEmpty(codeVerifier)
    if (codeEmptinessVerificationResult.isFailed()) {
      return false
    }

    const codeChallenge = this.crypter.base64URLEncode(this.crypter.sha256Hash(codeVerifier))

    const matchingCodeChallengeWasPresentAndRemoved = await this.pkceRepository.removeCodeChallenge(
      codeChallenge,
      userUuid,
    )

    return matchingCodeChallengeWasPresentAndRemoved
  }

  private async checkHumanVerificationIfNeeded(userIdentifier?: string, hvmToken?: string): Promise<Result<void>> {
    if (!userIdentifier) {
      return Result.ok()
    }

    const numberOfFailedAttempts = await this.lockRepository.getLockCounter(userIdentifier, 'non-captcha')
    const numberOfFailedAttemptsInCaptchaMode = await this.lockRepository.getLockCounter(userIdentifier, 'captcha')

    const isEligibleForNonCaptchaMode =
      numberOfFailedAttemptsInCaptchaMode === 0 && numberOfFailedAttempts < this.maxNonCaptchaAttempts

    if (isEligibleForNonCaptchaMode) {
      return Result.ok()
    }

    return this.verifyHumanInteractionUseCase.execute(hvmToken)
  }
}
