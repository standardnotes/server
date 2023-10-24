import * as bcrypt from 'bcryptjs'
import { Result, UseCaseInterface, Username, Uuid, Validator } from '@standardnotes/domain-core'
import { SettingName } from '@standardnotes/settings'

import { AuthResponse20200115 } from '../../Auth/AuthResponse20200115'
import { CrypterInterface } from '../../Encryption/CrypterInterface'
import { PKCERepositoryInterface } from '../../User/PKCERepositoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GenerateRecoveryCodes } from '../GenerateRecoveryCodes/GenerateRecoveryCodes'

import { SignInWithRecoveryCodesDTO } from './SignInWithRecoveryCodesDTO'
import { AuthResponseFactory20200115 } from '../../Auth/AuthResponseFactory20200115'
import { IncreaseLoginAttempts } from '../IncreaseLoginAttempts'
import { ClearLoginAttempts } from '../ClearLoginAttempts'
import { DeleteSetting } from '../DeleteSetting/DeleteSetting'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { ApiVersion } from '../../Api/ApiVersion'
import { GetSetting } from '../GetSetting/GetSetting'

export class SignInWithRecoveryCodes implements UseCaseInterface<AuthResponse20200115> {
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
  ) {}

  async execute(dto: SignInWithRecoveryCodesDTO): Promise<Result<AuthResponse20200115>> {
    const usernameOrError = Username.create(dto.username)
    if (usernameOrError.isFailed()) {
      return Result.fail(`Could not sign in with recovery codes: ${usernameOrError.getError()}`)
    }
    const username = usernameOrError.getValue()

    const validCodeVerifier = await this.validateCodeVerifier(dto.codeVerifier)
    if (!validCodeVerifier) {
      await this.increaseLoginAttempts.execute({ email: username.value })

      return Result.fail('Invalid code verifier')
    }

    const passwordValidationResult = Validator.isNotEmpty(dto.password)
    if (passwordValidationResult.isFailed()) {
      await this.increaseLoginAttempts.execute({ email: username.value })

      return Result.fail('Empty password')
    }

    const recoveryCodesValidationResult = Validator.isNotEmpty(dto.recoveryCodes)
    if (recoveryCodesValidationResult.isFailed()) {
      await this.increaseLoginAttempts.execute({ email: username.value })

      return Result.fail('Empty recovery codes')
    }

    const user = await this.userRepository.findOneByUsernameOrEmail(username)

    if (!user) {
      await this.increaseLoginAttempts.execute({ email: username.value })

      return Result.fail('Could not find user')
    }

    const userUuidOrError = Uuid.create(user.uuid)
    if (userUuidOrError.isFailed()) {
      await this.increaseLoginAttempts.execute({ email: username.value })

      return Result.fail('Invalid user uuid')
    }
    const userUuid = userUuidOrError.getValue()

    const passwordMatches = await bcrypt.compare(dto.password, user.encryptedPassword)
    if (!passwordMatches) {
      await this.increaseLoginAttempts.execute({ email: username.value })

      return Result.fail('Invalid password')
    }

    const recoveryCodesSettingOrError = await this.getSetting.execute({
      settingName: SettingName.NAMES.RecoveryCodes,
      userUuid: user.uuid,
      decrypted: true,
      allowSensitiveRetrieval: true,
    })
    if (recoveryCodesSettingOrError.isFailed()) {
      await this.increaseLoginAttempts.execute({ email: username.value })

      return Result.fail('User does not have recovery codes generated')
    }
    const recoveryCodesSetting = recoveryCodesSettingOrError.getValue()

    if (recoveryCodesSetting.decryptedValue !== dto.recoveryCodes) {
      await this.increaseLoginAttempts.execute({ email: username.value })

      return Result.fail('Invalid recovery codes')
    }

    const authResponse = await this.authResponseFactory.createResponse({
      user,
      apiVersion: ApiVersion.v20200115,
      userAgent: dto.userAgent,
      ephemeralSession: false,
      readonlyAccess: false,
    })

    const generateNewRecoveryCodesResult = await this.generateRecoveryCodes.execute({
      userUuid: user.uuid,
    })
    if (generateNewRecoveryCodesResult.isFailed()) {
      await this.increaseLoginAttempts.execute({ email: username.value })

      return Result.fail(`Could not sign in with recovery codes: ${generateNewRecoveryCodesResult.getError()}`)
    }

    await this.deleteSetting.execute({
      settingName: SettingName.NAMES.MfaSecret,
      userUuid: user.uuid,
    })

    await this.authenticatorRepository.removeByUserUuid(userUuid)

    await this.clearLoginAttempts.execute({ email: username.value })

    return Result.ok(authResponse.response as AuthResponse20200115)
  }

  private async validateCodeVerifier(codeVerifier: string): Promise<boolean> {
    const codeEmptinessVerificationResult = Validator.isNotEmpty(codeVerifier)
    if (codeEmptinessVerificationResult.isFailed()) {
      return false
    }

    const codeChallenge = this.crypter.base64URLEncode(this.crypter.sha256Hash(codeVerifier))

    const matchingCodeChallengeWasPresentAndRemoved = await this.pkceRepository.removeCodeChallenge(codeChallenge)

    return matchingCodeChallengeWasPresentAndRemoved
  }
}
