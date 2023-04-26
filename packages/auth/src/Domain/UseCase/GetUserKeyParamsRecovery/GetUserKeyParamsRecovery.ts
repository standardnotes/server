import { KeyParamsData } from '@standardnotes/responses'
import { Result, UseCaseInterface, Username, Validator } from '@standardnotes/domain-core'
import { SettingName } from '@standardnotes/settings'

import { KeyParamsFactoryInterface } from '../../User/KeyParamsFactoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetUserKeyParamsRecoveryDTO } from './GetUserKeyParamsRecoveryDTO'
import { User } from '../../User/User'
import { PKCERepositoryInterface } from '../../User/PKCERepositoryInterface'
import { SettingServiceInterface } from '../../Setting/SettingServiceInterface'

export class GetUserKeyParamsRecovery implements UseCaseInterface<KeyParamsData> {
  constructor(
    private keyParamsFactory: KeyParamsFactoryInterface,
    private userRepository: UserRepositoryInterface,
    private pkceRepository: PKCERepositoryInterface,
    private settingService: SettingServiceInterface,
  ) {}

  async execute(dto: GetUserKeyParamsRecoveryDTO): Promise<Result<KeyParamsData>> {
    const usernameOrError = Username.create(dto.username)
    if (usernameOrError.isFailed()) {
      return Result.fail(`Could not sign in with recovery codes: ${usernameOrError.getError()}`)
    }
    const username = usernameOrError.getValue()

    const recoveryCodesValidationResult = Validator.isNotEmpty(dto.recoveryCodes)
    if (recoveryCodesValidationResult.isFailed()) {
      return Result.fail('Invalid recovery codes')
    }

    const codeChallengeValidationResult = Validator.isNotEmpty(dto.codeChallenge)
    if (codeChallengeValidationResult.isFailed()) {
      return Result.fail('Invalid code challenge')
    }

    const user = await this.userRepository.findOneByUsernameOrEmail(username)
    if (!user) {
      return Result.ok(this.keyParamsFactory.createPseudoParams(username.value))
    }

    const recoveryCodesSetting = await this.settingService.findSettingWithDecryptedValue({
      settingName: SettingName.create(SettingName.NAMES.RecoveryCodes).getValue(),
      userUuid: user.uuid,
    })
    if (!recoveryCodesSetting) {
      return Result.fail('User does not have recovery codes generated')
    }

    if (recoveryCodesSetting.value !== dto.recoveryCodes) {
      return Result.fail('Invalid recovery codes')
    }

    const keyParams = await this.createKeyParams(dto.codeChallenge, user)

    return Result.ok(keyParams)
  }

  private async createKeyParams(codeChallenge: string, user: User): Promise<KeyParamsData> {
    await this.pkceRepository.storeCodeChallenge(codeChallenge)

    return this.keyParamsFactory.create(user, false)
  }
}
